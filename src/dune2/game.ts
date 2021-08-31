import { createTerrainGenerator, Terrain } from "./land"
import { LandConfig } from "./types"

import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import * as Engine from "@/engine"

import { PaintDevice } from "@/graphics"
import { RectangularCoordinates, Size } from "@/maths"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export type UnitType = keyof typeof Units
export type UnitFactory = (t: UnitType, p: RectangularCoordinates) => Engine.Unit

export interface GameConfig {
    screen: PaintDevice,
    size: Size,
    land?: LandConfig,
}

export interface Game {
    readonly engine: Engine.Game<Terrain>
    readonly miniMap: Engine.MiniMap
    createUnit: UnitFactory
}

function createUnitFactory(game: Engine.Game<Terrain>)
    : UnitFactory {
    return (type: UnitType, position: RectangularCoordinates) => {
        const unit = new Units[type](game.scene, position)
        game.addUnit(unit)
        return unit
    }
}

function setupStartLocation(engine: Engine.Game<Terrain>): void {
    const { land, scene } = engine
    const x = Math.floor(land.size.width/2)
    const y = Math.floor(land.size.height/2)

    land.reveal({ x: x - 3, y: y - 2 }, { width: 5, height: 3 })
    land.reveal({ x: x - 2, y: y - 3 }, { width: 3, height: 5 })
    scene.viewport.position = {
        x: x - scene.viewport.size.width/2,
        y: y - scene.viewport.size.height/2,
    }
}

export function createGame(config: GameConfig): Game {
    const { screen, size } = config
    const engine = Engine.createGame<Terrain>({
        screen,
        size,
        generateTerrain: createTerrainGenerator(config.land ?? {}),
    })
    const miniMap = Engine.createMiniMap(engine)
    const createUnit = createUnitFactory(engine)

    setupStartLocation(engine)

    return {
        get engine() { return engine },
        get miniMap() { return miniMap },
        createUnit,
    }
}
