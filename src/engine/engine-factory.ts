/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GameMetadataKeys,
    GameLandTerrainGenerator,
    GameLandTerrainColorProvider,
    GameLandTilesProvider,
    GameMinimap,
    GameMode,
    GameScene,
} from "@/engine/constants"

import {
    Container,
    Token,
} from "@/engine/injector"

import {
    Land,
    LandConfigurationError,
} from "@/engine/land"

import { MiniMap } from "@/engine/mini-map"

import {
    Scene,
    screenToSceneScale,
} from "@/engine/scene"

import {
    Mode,
    GameState,
    type IGameEvents,
    type IGameMetadata,
} from "@/engine/types"

import {
    type IPaintDevice,
} from "@/graphics"

import {
    createObservable,
    fetchData,
    IEmitter,
    type IObservable,
} from "@/utils"

import { clamp, isNil } from "lodash"

const GameEventsEmitter = new Token<IEmitter<IGameEvents>>("game:events:emitter")

export interface IEngine {
    readonly events: IObservable<IGameEvents>
    get<T>(id: Token<T>): T
    initialize(): Promise<IEngine>
    start(): IEngine
    stop(): IEngine
}

function getGameResourcesMetadata(game: any) {
    const rcMeta = Reflect.getMetadata(GameMetadataKeys.resources, game) ?? []
    return rcMeta as NonNullable<IGameMetadata["resources"]>
}

function getGameLandMetadata(game: any) {
    const landMeta = Reflect.getMetadata(GameMetadataKeys.land, game)
    if (isNil(landMeta)) {
        throw new LandConfigurationError("Missing land configuration")
    }
    if (isNil(landMeta.id)) {
        throw new LandConfigurationError("Land configuration miss id property")
    }
    if (isNil(landMeta.generator)) {
        throw new LandConfigurationError("Land configuration miss generator property")
    }
    if (isNil(landMeta.tilesProvider)) {
        throw new LandConfigurationError("Land configuration miss tilesProvider property")
    }
    return landMeta as NonNullable<IGameMetadata["land"]>
}

async function initializeScene(
    container: Container,
    screen: IPaintDevice,
) {
    const scene = new Scene(screen)

    container.set(GameScene, scene)
    screen.events.on("mouseMoved", event => {
        const { button, ctrlKey, movement } = event
        const { x: offsetX, y: offsetY } = screenToSceneScale(scene, {
            x: -movement.x,
            y: -movement.y,
        })

        // drag scene
        if (ctrlKey && button) {
            if (offsetX !== 0 || offsetY !== 0) {
                const { x, y, width, height } = scene.viewport.rect
                scene.viewport.position = {
                    x: clamp(x + offsetX, 0, scene.width - width),
                    y: clamp(y + offsetY, 0, scene.height - height),
                }
            }
        }
    })
}

async function initializeResources(
    container: Container,
    game: any,
): Promise<void> {
    const emitter = container.get(GameEventsEmitter)

    for (const rcDescriptor of getGameResourcesMetadata(game)) {
        const rcDecoder = container.get(rcDescriptor.decoder)
        const { id, name } = rcDescriptor

        emitter.emit("downloadingResourceBegin", { id, name })
        const rcData = await fetchData(rcDescriptor.uri, (current, total) => {
            emitter.emit("downloadingResourceProgress", {
                id,
                name,
                current,
                total,
            })
        })
        emitter.emit("downloadingResourceEnd", { id, name })

        emitter.emit("decodingResourceBegin", { id, name })
        const rc = await rcDecoder.decode(rcData, rcDescriptor.id)
        emitter.emit("decodingResourceEnd", { id, name })

        container.set(rcDescriptor.id, rc)
    }
}

async function initializeLand(
    container: Container,
    game: any,
) {
    const { id, generator, colorsProvider, tilesProvider } = getGameLandMetadata(game)

    container.set(GameLandTerrainGenerator, generator)
    container.set(GameLandTilesProvider, tilesProvider)
    container.set(GameLandTerrainColorProvider, colorsProvider)
    container.set(GameMinimap, MiniMap)
    container.set(id, Land)

    const land = container.get(id)

    land.events.on("reset", size => {
        container.get(GameScene).size = size
    })
}

export function create(
    game: any,
    mode: Mode,
    screen: IPaintDevice,
): IEngine {
    const container = new Container()
    const state = {
        animationRequestId: 0,
        running: false,
    }

    const [emitter, events] = createObservable<IGameEvents>()

    container.set(GameEventsEmitter, emitter)
    container.set(GameMode, mode)

    return {
        get events()
            : IObservable<IGameEvents> {
            return events
        },
        get<T>(id: Token<T>): T {
            return container.get(id)
        },
        async initialize() {
            emitter.emit("stateChanged", GameState.Initializing)
            await initializeScene(container, screen)
            await initializeResources(container, game)
            await initializeLand(container, game)
            emitter.emit("stateChanged", GameState.Stopped)
            return this
        },
        start(): IEngine {
            if (!state.running) {
                state.running = true
                emitter.emit("stateChanged", GameState.Running)

                const scene = container.get(GameScene)
                const land = container.get(Land)

                scene.addItem(land.view)

                const animationLoop = () => {
                    scene.render()
                    state.animationRequestId = requestAnimationFrame(animationLoop)
                }

                animationLoop()
            }
            return this as IEngine
        },
        stop(): IEngine {
            cancelAnimationFrame(state.animationRequestId)
            state.running = false
            state.animationRequestId = 0
            emitter.emit("stateChanged", GameState.Stopped)
            return this as IEngine
        }
    }
}
