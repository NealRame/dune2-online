import { createScene } from "./scene"
import { createLand, Land, Terrain, TerrainGenerator } from "./land"
import { Scene } from "./types"
import { Unit } from "./unit"

import { PaintDevice } from "@/graphics"
import { Size } from "@/maths"

export interface GameConfig<T extends Terrain = Terrain> {
    screen: PaintDevice
    size: Size
    generateTerrain: TerrainGenerator<T>
}

export interface Game<T extends Terrain = Terrain> {
    scene: Scene,
    land: Land<T>,
    addUnit(unit: Unit): Game<T>
    start(): void
}

export function createGame<T extends Terrain = Terrain>(config: GameConfig<T>): Game<T> {
    const scene = createScene(config.size, config.screen.painter)
    const landLayer = scene.addLayer("land")
    const land = createLand(scene, config)

    scene.addLayer("land").addItem(land)
    landLayer.addItem(land)

    const unitLayer = scene.addLayer("units")
    // const structureLayer = scene.addLayer("structures")

    return {
        get scene() {
            return scene
        },
        get land() {
            return land
        },
        addUnit(unit: Unit) {
            unitLayer.addItem(unit)
            return this
        },
        start(): void {
            scene.run()
        },
    }
}
