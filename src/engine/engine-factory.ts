/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { clamp, isNil } from "lodash"

import {
    GameMetadataKeys,
    GameLandTerrainGenerator,
    GameLandTerrainColorProvider,
    GameLandTilesProvider,
    GameUnitsManager,
    GameMinimap,
    GameMode,
    GameScene,
    GameState,
} from "@/engine/constants"

import {
    EntityManager,
} from "@/engine/entity"

import {
    Container,
    type TConstructor,
    type Token,
} from "@/engine/injector"

import { MiniMap } from "@/engine/mini-map"

import * as Land from "@/engine/land"
import * as Resource from "@/engine/resources"

import {
    Scene,
    screenToSceneScale,
} from "@/engine/scene"

import {
    type IGameResourceList,
} from "@/engine/resources"

import {
    Mode,
    State,
    type IGameController,
    type IGameEvents,
    type IGameEngine,
    type IGameMetadata,
} from "@/engine/types"

import {
    ScreenMouseMotionEvent,
    type IPaintDevice,
} from "@/graphics"

import {
    createObservable,
    fetchData,
    type IEmitter,
    type IObservable,
} from "@/utils"

const GameEventsEmitter: Token<IEmitter<IGameEvents>> = Symbol("game:events:emitter")
const Game: Token<IGameController> = Symbol("game:module")

export class EngineNotReadyError extends Error {
    constructor() {
        super("Engine not ready. You should call Engine#initialize() method and wait for it to be ready")
        Object.setPrototypeOf(this, EngineNotReadyError.prototype)
    }
}

function getGameResources(game: any) {
    return (Reflect.getMetadata(GameMetadataKeys.resources, game) ?? []) as IGameResourceList
}

function getGameLandId(game: any) {
    return Reflect.getMetadata(GameMetadataKeys.land, game) as Token<Land.ILand>
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

    for (const id of getGameResources(game)) {
        const rcMetadata = Resource.getMetadata(id)
        const rcDecoder = container.get(rcMetadata.Decoder)

        const name = rcMetadata.name

        emitter.emit("downloadingResourceBegin", { id, name })
        const rcData = await fetchData(rcMetadata.uri, (current, total) => {
            emitter.emit("downloadingResourceProgress", {
                id,
                name,
                current,
                total,
            })
        })
        emitter.emit("downloadingResourceEnd", { id, name })

        emitter.emit("decodingResourceBegin", { id, name })
        const rc = await rcDecoder.decode(rcData, id, name)
        emitter.emit("decodingResourceEnd", { id, name })

        container.set(id, rc)
    }
}

async function initializeLand(
    container: Container,
    game: any,
) {
    const { Generator, ColorsProvider, TilesProvider } = Land.getMetadata()

    container.set(GameLandTerrainColorProvider, ColorsProvider)
    container.set(GameLandTerrainGenerator, Generator)
    container.set(GameLandTilesProvider, TilesProvider)
    container.set(GameMinimap, MiniMap)
}

async function initializeEntityManager(
    container: Container,
    game: any,
) {
    const um = container.get(EntityManager)
    container.set(GameUnitsManager, um)
}

export function create(
    GameController: TConstructor<IGameController>,
): IGameEngine {
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
            await initializeResources(container, GameController)
            await initializeLand(container, GameController)
            await initializeEntityManager(container, GameController)
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
            const landId = getGameLandId(GameController)

            container.set(GameMode, mode)

            const land = container.get(Land.Land)
            container.set(landId, land)

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

            const landId = getGameLandId(GameController)

            const land = container.get(landId)
            land.events.clear()

            container.remove(landId)

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
    container.set(Game, new GameController())

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
            container.get(Game).onStart(this)
            return this as IGameEngine
        },
        stop() {
            stopEngine()
            container.get(Game).onStop(this)
            return this as IGameEngine
        }
    }
}
