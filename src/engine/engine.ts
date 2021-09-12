import { createScene, IScene, SceneLayer } from "./scene"
import { createLand, ILand, ITerrain, TerrainGenerator } from "./land"
import { Unit } from "./unit"

import { Painter } from "@/graphics"
import { ISize } from "@/maths"

export interface Config<T extends ITerrain = ITerrain> {
    painter: Painter
    size: ISize
    generateTerrain: TerrainGenerator<T>
}

export interface Engine<T extends ITerrain = ITerrain> {
    readonly land: ILand<T>
    readonly scene: IScene
    addUnit(unit: Unit): Engine<T>
    start(): Engine<T>
    stop(): Engine<T>
}

export function create<T extends ITerrain>(config: Config<T>)
    : Engine<T> {
    const scene = createScene(config.size, config.painter)
    const land = createLand(scene, config)

    const units = new SceneLayer(scene, "units")

    let animationRequestId = 0

    scene
        .addItem(land)
        .addItem(units)

    return {
        get land() {
            return land
        },
        get scene() {
            return scene
        },
        addUnit(unit: Unit) {
            units.addItem(unit)
            return this
        },
        start(): Engine<T> {
            (function animationLoop() {
                scene
                    .update()
                    .render()
                animationRequestId = requestAnimationFrame(animationLoop)
            })()
            return this
        },
        stop(): Engine<T> {
            cancelAnimationFrame(animationRequestId)
            animationRequestId = 0
            return this
        }
    }
}
