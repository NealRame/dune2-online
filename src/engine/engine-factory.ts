/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    GameMetadataKeys,
    GameLandTerrainGenerator,
    GameLandTilesProvider,
    GameMode,
    GameScene,
} from "./constants"
import {
    Land,
    LandConfigurationError,
} from "./land"
import {
    Container,
    Token,
} from "./injector"
import {
    Scene,
    screenToSceneScale,
} from "./scene"
import {
    GameEngineMode,
    GameMetadata,
    IProgressNotifier
} from "./types"

import {
    Painter
} from "@/graphics"

import {
    fetchData
} from "@/utils"

import { isNil } from "lodash"

export interface IEngine {
    get<T>(id: Token<T>): T
    start(): IEngine
    stop(): IEngine
}

function getGameResourcesMetadata(game: any) {
    const rcMeta = Reflect.getMetadata(GameMetadataKeys.resources, game) ?? []
    return rcMeta as NonNullable<GameMetadata["resources"]>
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
    return landMeta as NonNullable<GameMetadata["land"]>
}

async function initializeScene(
    container: Container,
    screen: HTMLCanvasElement,
) {
    const painter = new Painter(screen)
    const scene = new Scene({ width: 64, height: 64 }, painter)

    screen.addEventListener("mousemove", (ev: MouseEvent) => {
        const { buttons, ctrlKey, movementX, movementY } = ev
        const { x: offsetX, y: offsetY } = screenToSceneScale(scene, {
            x: -movementX,
            y: -movementY,
        })

        // drag scene
        if (ctrlKey && buttons === 1) {
            if (offsetX !== 0 || offsetY !== 0) {
                const { x, y } = scene.viewport.position
                scene.viewport.position = {
                    x: x + offsetX,
                    y: y + offsetY,
                }
            }
        }
    })

    container.set(GameScene, scene)
}

async function initializeResources(
    game: any,
    container: Container,
    progress: IProgressNotifier,
): Promise<void> {
    progress.begin()
    for (const rcDescriptor of getGameResourcesMetadata(game)) {
        const rcDecoder = container.get(rcDescriptor.decoder)

        progress.setLabel(`Downloading ${rcDescriptor.name}`)
        progress.setValue(0)
        const rcData = await fetchData(rcDescriptor.uri, (current, total) => {
            progress.setValue(current/total)
        })

        progress.setLabel(`Decoding ${rcDescriptor.name}`)
        progress.setValue(null)
        const rc = await rcDecoder.decode(rcData, rcDescriptor.id)

        container.set(rcDescriptor.id, rc)
    }
    progress.end()
}

async function initializeLand(
    game: any,
    container: Container,
) {
    const { id, generator, tilesProvider } = getGameLandMetadata(game)

    container.set(GameLandTerrainGenerator, generator)
    container.set(GameLandTilesProvider, tilesProvider)
    container.set(id, Land)
}

export async function create(
    game: any,
    mode: GameEngineMode,
    screen: HTMLCanvasElement,
    progress: IProgressNotifier,
): Promise<IEngine> {
    const container = new Container()
    const state = {
        animationRequestId: 0,
        running: false,
    }

    container.set(GameMode, mode)

    await initializeScene(container, screen)
    await initializeResources(game, container, progress)
    await initializeLand(game, container)

    return {
        get<T>(id: Token<T>): T {
            return container.get(id)
        },
        start(): IEngine {
            if (!state.running) {
                state.running = true

                const scene = container.get(GameScene)
                const land = container.get(Land)

                land.reset()
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
            state.animationRequestId = 0
            state.running = false
            return this as IEngine
        }
    }
}
