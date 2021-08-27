import { createLand, Land, Terrain, TerrainGenerator } from "./land"
import { createMiniMap, MiniMap } from "./mini-map"
import { createScene } from "./scene"
import { Scene } from "./types"
import { Unit } from "./unit"

import { PaintDevice } from "@/graphics"
import { Size } from "@/maths"
import { isNil } from "lodash"

interface GameState {
    animationRequestId: number
    minimap: MiniMap|null
    scene: Scene
}

export interface GameConfig<T extends Terrain = Terrain> {
    screen: PaintDevice
    size: Size
    generateTerrain: TerrainGenerator<T>
}

export interface Game<T extends Terrain = Terrain> {
    readonly land: Land<T>
    readonly minimap: MiniMap
    readonly scene: Scene
    addUnit(unit: Unit): Game<T>
    start(): Game<T>
    stop(): Game<T>
}

export function createGame<T extends Terrain = Terrain>(config: GameConfig<T>)
    : Game<T> {
    const state: GameState = {
        animationRequestId: 0,
        minimap: null,
        scene: createScene(config.size, config.screen.painter),
    }

    state.scene.addLayer(createLand(state.scene, config))
    state.scene.addLayer("units")

    return {
        get land() {
            return state.scene.getLayer("land") as Land<T>
        },
        get minimap() {
            if (isNil(state.minimap)) {
                state.minimap = createMiniMap(this)
            }
            return state.minimap
        },
        get scene() {
            return state.scene
        },
        addUnit(unit: Unit) {
            const unitLayer = state.scene.getLayer("units")
            if (!isNil(unitLayer)) {
                unitLayer.addItem(unit)
            }
            return this
        },
        start(): Game<T> {
            (function animationLoop() {
                state.scene
                    .update()
                    .render()
                state.animationRequestId = requestAnimationFrame(animationLoop)
            })()
            return this
        },
        stop(): Game<T> {
            cancelAnimationFrame(state.animationRequestId)
            state.animationRequestId = 0
            return this
        }
    }
}
