import { createScene, IScene } from "./scene"
import { createLand, Land, Terrain, TerrainGenerator } from "./land"
import { Unit } from "./unit"

import { Painter } from "@/graphics"
import { ISize } from "@/maths"

import { isNil } from "lodash"

interface State {
    animationRequestId: number
    scene: IScene
}

export interface Config<T extends Terrain = Terrain> {
    painter: Painter
    size: ISize
    generateTerrain: TerrainGenerator<T>
}

export interface Engine<T extends Terrain = Terrain> {
    readonly land: Land<T>
    readonly scene: IScene
    addUnit(unit: Unit): Engine<T>
    start(): Engine<T>
    stop(): Engine<T>
}

export function create<T extends Terrain>(config: Config<T>)
    : Engine<T> {
    const state: State = {
        animationRequestId: 0,
        scene: createScene(config.size, config.painter),
    }

    state.scene.addLayer(createLand(state.scene, config))
    state.scene.addLayer("units")

    return {
        get land() {
            return state.scene.getLayer("land") as Land<T>
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
        start(): Engine<T> {
            (function animationLoop() {
                state.scene
                    .update()
                    .render()
                state.animationRequestId = requestAnimationFrame(animationLoop)
            })()
            return this
        },
        stop(): Engine<T> {
            cancelAnimationFrame(state.animationRequestId)
            state.animationRequestId = 0
            return this
        }
    }
}
