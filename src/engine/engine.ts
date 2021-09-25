import { Scene, SceneLayer } from "./scene"
import { ILand, ITerrainData, LandConstructor, LandInitialData } from "./land"
import { Unit } from "./unit"

import { Painter } from "@/graphics"
import { ISize } from "@/maths"

export interface Config<T extends ITerrainData> {
    painter: Painter
    size: ISize
    Land: LandConstructor<T>
    landData: LandInitialData<T>
}

export interface Engine<T extends ITerrainData> {
    readonly scene: Scene
    readonly land: ILand<T>
    addUnit(unit: Unit): Engine<T>
    start(): Engine<T>
    stop(): Engine<T>
}

export function create<T extends ITerrainData>(
    config: Config<T>
): Engine<T> {
    const scene = new Scene(config.size, config.painter)
    const land = new config.Land(scene, config.landData)
    const units = new SceneLayer(scene)

    let animationRequestId = 0

    scene
        .addItem(land.view)
        .addItem(units)

    return {
        get scene() {
            return scene
        },
        get land() {
            return land
        },
        addUnit(unit: Unit): Engine<T> {
            units.addItem(unit)
            return this
        },
        start(): Engine<T> {
            (function animationLoop() {
                scene.render()
                land.update()
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
