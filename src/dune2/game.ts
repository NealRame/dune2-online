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
    readonly minimap: Engine.MiniMap
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

export function createGame(config: GameConfig): Game {
    const { screen, size } = config

    const engine = Engine.createGame<Terrain>({
        screen,
        size,
        generateTerrain: createTerrainGenerator(config.land ?? {}),
    })
    const minimap = Engine.createMiniMap(engine)
    const createUnit = createUnitFactory(engine)

    return {
        get engine() { return engine },
        get minimap() { return minimap },
        createUnit,
    }

    // const game = Object.create()
    // const minimap = Engine.

    // game.createUnit =

    // return game
}
