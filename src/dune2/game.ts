import { createTerrainGenerator, Terrain } from "./land"
import { LandConfig } from "./types"

import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import { createScene, Scene, Unit } from "@/engine"
import { createLand, Land } from "@/engine/land"

import { PaintDevice } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export interface GameConfig {
    screen: PaintDevice,
    map: LandConfig,
}

export interface Game {
    scene: Scene,
    land: Land<Terrain>,
    addUnit(type: keyof typeof Units, position: RectangularCoordinates): Unit
    start(): void
}

export function createGame(config: GameConfig): Game {
    const scene = createScene()
    const map = createLand(scene, config.map, createTerrainGenerator(config.map))

    scene.addItem(map)
    scene.gridEnabled = false

    return {
        get scene() {
            return scene
        },
        get land() {
            return map
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
