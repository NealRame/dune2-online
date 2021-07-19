import { Unit } from "./units/unit"
import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import { createScene } from "@/engine"
import { PaintDevice } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export interface Game {
    addUnit(type: keyof typeof Units, position: RectangularCoordinates): Unit
    start(): void
}

export { Unit } from "./units/unit"

export function createGame(screen: PaintDevice): Game {
    const scene = createScene()
    return {
        start(): void {
            scene.run(screen.painter)
        },
        addUnit(type, position) {
            return new Units[type](scene, position)
        }
    }
}
