import * as Data from "./data"
import * as Unit from "./units"
import { LandConfig } from "./types"
import { createLandDataGenerator, ITerrainData, Land } from "./land"
import { MiniMap } from "./mini-map"

import * as Engine from "@/engine"
import { Painter } from "@/graphics"
import { ISize2D, IVector2D } from "@/maths"

import { once } from "lodash"

export type UnitFactory = (t: Unit.UnitType, p: IVector2D) => Engine.Unit

export interface GameConfig {
    painter: Painter,
    size: ISize2D,
    land?: LandConfig,
}

export interface Game {
    readonly engine: Engine.Engine<ITerrainData>
    readonly miniMap: Engine.IMiniMap
    readonly data: typeof Data
    createUnit: UnitFactory
    initialize: () => void
}

function createUnitFactory(engine: Engine.Engine<ITerrainData>)
    : UnitFactory {
    return (type: Unit.UnitType, position: IVector2D) => {
        return engine.units.add(Unit.create(engine.scene, type, position)) as Engine.Unit
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
        get data() { return Data },
        createUnit: createUnitFactory(engine),
        initialize: once(() => {
            setupStartLocation(engine)
            engine.start()
        })
    }
}
