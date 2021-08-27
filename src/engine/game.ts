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
    scene: Scene
    land: Land<T>
    addUnit(unit: Unit): Game<T>
    start(): Game<T>
    stop(): Game<T>
}

export function createGame<T extends Terrain = Terrain>(config: GameConfig<T>): Game<T> {
    let requestAnimationId = 0
    const scene = createScene(config.size, config.screen.painter)
    const land = createLand(scene, config)

    scene.addLayer(land)

    // const structureLayer = scene.addLayer("structures")
    const unitLayer = scene.addLayer("units")

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
        start(): Game<T> {
            const loop = () => {
                scene
                    .update()
                    .render()
                requestAnimationId = requestAnimationFrame(loop)
            }
            loop()
            return this
        },
        stop(): Game<T> {
            cancelAnimationFrame(requestAnimationId)
            requestAnimationId = 0
            return this
        }
    }
}
