import { createTerrainGenerator, Terrain } from "./land"
import { LandConfig } from "./types"

import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import * as Engine from "@/engine"

import { Painter } from "@/graphics"
import { IRectangularCoordinates, ISize } from "@/maths"
import { once } from "lodash"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export type UnitType = keyof typeof Units
export type UnitFactory = (t: UnitType, p: IRectangularCoordinates) => Engine.Unit

export interface GameConfig {
    painter: Painter,
    size: ISize,
    land?: LandConfig,
}

export interface Game {
    readonly engine: Engine.Engine<Terrain>
    readonly miniMap: Engine.IMiniMap
    createUnit: UnitFactory
    initialize: () => void
}

function createUnitFactory(game: Engine.Engine<Terrain>)
    : UnitFactory {
    return (type: UnitType, position: IRectangularCoordinates) => {
        const unit = new Units[type](game.scene, position)
        game.addUnit(unit)
        return unit
    }
}

function setupStartLocation(engine: Engine.Engine<Terrain>): void {
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
    const { painter, size } = config
    const engine = Engine.create<Terrain>({
        painter,
        size,
        generateTerrain: createTerrainGenerator(config.land ?? {}),
    })
    const miniMap = Engine.createMiniMap(engine)
    const createUnit = createUnitFactory(engine)

    return {
        get engine() { return engine },
        get miniMap() { return miniMap },
        createUnit,
        initialize: once(() => {
            setupStartLocation(engine)
            engine.start()
        })
    }
}
