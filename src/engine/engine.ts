import { Scene } from "./scene"
import { ILand, ITerrainData, LandConstructor, LandInitialData } from "./land"

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
    start(): Engine<T>
    stop(): Engine<T>
}

export function create<T extends ITerrainData>(
    config: Config<T>
): Engine<T> {
    const scene = new Scene(config.size, config.painter)
    const land = new config.Land(scene, config.landData)

    let animationRequestId = 0

    land.name = "land"
    scene.addItem(land)

    return {
        get scene() {
            return scene
        },
        get land() {
            return land
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
