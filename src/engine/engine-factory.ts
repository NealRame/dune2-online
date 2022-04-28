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
    State,
    type IGameEvents,
    type IGameMetadata,
} from "@/engine/types"

import {
    ScreenMouseMotionEvent,
    type IPaintDevice,
} from "@/graphics"

import {
    createObservable,
    fetchData,
    IEmitter,
    type IObservable,
} from "@/utils"

import { clamp, isNil } from "lodash"
import { GameState } from "."

const GameEventsEmitter = new Token<IEmitter<IGameEvents>>("game:events:emitter")

export class EngineNotReadyError extends Error {
    constructor() {
        super("Engine not ready. You should call Engine#initialize() method and wait for it to be ready")
        Object.setPrototypeOf(this, EngineNotReadyError.prototype)
    }
}

export interface IEngine {
    readonly events: IObservable<IGameEvents>
    get<T>(id: Token<T>): T
    initialize(): Promise<IEngine>
    start(mode: Mode, screen: IPaintDevice): IEngine
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
    if (isNil(landMeta.Generator)) {
        throw new LandConfigurationError("Land configuration miss Generator property")
    }
    if (isNil(landMeta.TilesProvider)) {
        throw new LandConfigurationError("Land configuration miss TilesProvider property")
    }
    if (isNil(landMeta.ColorsProvider)) {
        throw new LandConfigurationError("Land configuration miss ColorsProvider property")
    }
    return landMeta as NonNullable<IGameMetadata["land"]>
}

async function initializeScene(
    container: Container,
) {
    const scene = new Scene()
    container.set(GameScene, scene)
}

function dragHandler(scene: Scene) {
    return (event: ScreenMouseMotionEvent) => {
        const viewport = scene.viewport

        if (isNil(viewport)) return

        const { button, ctrlKey, movement } = event
        const { x: offsetX, y: offsetY } = screenToSceneScale(scene, {
            x: -movement.x,
            y: -movement.y,
        })

        // drag scene
        if (ctrlKey && button) {
            if (offsetX !== 0 || offsetY !== 0) {
                const { x, y, width, height } = viewport.rect
                viewport.position = {
                    x: clamp(x + offsetX, 0, scene.width - width),
                    y: clamp(y + offsetY, 0, scene.height - height),
                }
            }
        }
    }
}

async function initializeResources(
    container: Container,
    game: any,
): Promise<void> {
    const emitter = container.get(GameEventsEmitter)

    for (const rcDescriptor of getGameResourcesMetadata(game)) {
        const rcDecoder = container.get(rcDescriptor.Decoder)
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
    const { Generator, ColorsProvider, TilesProvider } = getGameLandMetadata(game)

    container.set(GameLandTerrainColorProvider, ColorsProvider)
    container.set(GameLandTerrainGenerator, Generator)
    container.set(GameLandTilesProvider, TilesProvider)
    container.set(GameMinimap, MiniMap)
}

export function create(
    game: any,
): IEngine {
    const [emitter, events] = createObservable<IGameEvents>()
    const container = new Container()

    const updateEngineState = (state: State) => {
        container.set(GameState, state)
        emitter.emit("stateChanged", state)
    }

    const waitForReady = (): Promise<void> => {
        return new Promise(resolve => {
            events.once("stateChanged", state => {
                if (state === State.Ready) {
                    resolve()
                }
            })
        })
    }

    const initializeEngine = async () => {
        if (!container.has(GameState)) {
            updateEngineState(State.Initializing)
            await initializeScene(container)
            await initializeResources(container, game)
            await initializeLand(container, game)
            updateEngineState(State.Ready)
        } else if (container.get(GameState) === State.Initializing) {
            await waitForReady()
        }
    }

    let animationRequestId = 0

    const startEngine = (mode: Mode, screen: IPaintDevice) => {
        if (!container.has(GameState)) {
            throw new EngineNotReadyError()
        }
        if (container.get(GameState) === State.Ready) {
            const { id: GameLand } = getGameLandMetadata(game)

            container.set(GameMode, mode)

            const land = container.get(Land)
            container.set(GameLand, land)

            const minimap = container.get(GameMinimap)
            minimap.land = land

            const scene = container.get(GameScene)

            land.events.on("reset", size => {
                scene.size = size
            })

            scene.screen = screen
            scene.addItem(land.view)
            screen.events.on("mouseMoved", dragHandler(scene))

            updateEngineState(State.Running)

            const animationLoop = () => {
                scene.render()
                animationRequestId = requestAnimationFrame(animationLoop)
            }

            animationLoop()
        }
    }

    const stopEngine = () => {
        if (container.has(GameState)
            && container.get(GameState) === State.Running) {
            cancelAnimationFrame(animationRequestId)

            const { id: GameLand } = getGameLandMetadata(game)

            const land = container.get(GameLand)
            land.events.clear()

            container.remove(GameLand)

            const minimap = container.get(GameMinimap)
            minimap.land = null
            minimap.events.clear()

            const scene = container.get(GameScene)
            scene.clear()
            scene.screen = null

            updateEngineState(State.Ready)
        }
    }

    container.set(GameEventsEmitter, emitter)

    return {
        get events()
            : IObservable<IGameEvents> {
            return events
        },
        get<T>(id: Token<T>): T {
            return container.get(id)
        },
        async initialize() {
            await initializeEngine()
            return this
        },
        start(mode: Mode, screen: IPaintDevice) {
            startEngine(mode, screen)
            return this as IEngine
        },
        stop() {
            stopEngine()
            return this as IEngine
        }
    }
}
