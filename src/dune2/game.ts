import { createMap } from "./map"
import { MapConfig } from "./types"

import { Unit } from "./units/unit"
import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import { createScene, Scene } from "@/engine"
import { PaintDevice } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export interface GameConfig {
    screen: PaintDevice,
    map: MapConfig,
}

export interface Game {
    scene: Scene
    addUnit(type: keyof typeof Units, position: RectangularCoordinates): Unit
    start(): void
}

export { Unit } from "./units/unit"

export async function createGame(config: GameConfig): Promise<Game> {
    const scene = createScene()
    const map = await createMap(scene, config.map)

    scene.gridEnabled = false
    scene.addItem(map)

    return {
        get scene() {
            return scene
        },
        addUnit(type, position) {
            const unit = new Units[type](scene, position)
            scene.addItem(unit)
            return unit
        },
        start(): void {
            scene.run(config.screen.painter)
        },
    }
}
