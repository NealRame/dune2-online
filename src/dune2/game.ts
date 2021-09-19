import { LandConfig } from "./types"
import { createLandDataGenerator, ITerrainData, Land } from "./land"
import { MiniMap } from "./mini-map"

import { Harvester } from "./units/harvester"
import { Quad } from "./units/quad"
import { Trike } from "./units/trike"

import * as Engine from "@/engine"

import { Painter } from "@/graphics"
import { IVector2D, ISize } from "@/maths"
import { once } from "lodash"
import { IMiniMap } from "@/engine"

export const Units = {
    Harvester,
    Quad,
    Trike,
} as const

export type UnitType = keyof typeof Units
export type UnitFactory = (t: UnitType, p: IVector2D) => Engine.Unit

export interface GameConfig {
    painter: Painter,
    size: ISize,
    land?: LandConfig,
}

export interface Game {
    readonly engine: Engine.Engine<ITerrainData>
    readonly miniMap: IMiniMap
    createUnit: UnitFactory
    initialize: () => void
}

function createUnitFactory(engine: Engine.Engine<ITerrainData>)
    : UnitFactory {
    return (type: UnitType, position: IVector2D) => {
        const unit = new Units[type](engine.scene, position)
        engine.addUnit(unit)
        return unit
    }
}

function setupStartLocation(engine: Engine.Engine<ITerrainData>): void {
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
    const engine = Engine.create({
        painter,
        size,
        Land,
        landData: createLandDataGenerator()
    })
    const miniMap = new MiniMap(engine)

    return {
        get engine() { return engine },
        get miniMap() { return miniMap },
        createUnit: createUnitFactory(engine),
        initialize: once(() => {
            setupStartLocation(engine)
            engine.start()
        })
    }
}
