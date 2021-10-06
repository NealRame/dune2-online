import { QuadView } from "./quad"
import { HarvesterView } from "./harvester"
import { TrikeView } from "./trike"

import * as Engine from "@/engine"
import { IVector2D } from "@/maths"
import { IUnitData } from "@/engine"

export class Unit extends Engine.Unit {
    private view_: Engine.ISceneItem

    constructor(
        scene: Engine.IScene,
        position: IVector2D,
        data: Engine.IUnitData,
        View: new (scene: Engine.IScene, unit: Unit) => Engine.ISceneItem,
    ) {
        super(scene, data)
        this.x_ = position.x
        this.y_ = position.y
        this.view_ = new View(scene, this)
    }

    get view()
        : Engine.ISceneItem {
        return this.view_
    }
}

export const UnitTypes = ["Harvester", "Quad", "Trike"] as const
export type UnitType = typeof UnitTypes[number]

export function create(
    scene: Engine.IScene,
    type: UnitType,
    position: IVector2D,
): Unit {
    if (type === "Harvester") {
        const data: IUnitData = {
            speed: 0.5,
            health: 2.0,
        }
        return new Unit(scene, position, data, HarvesterView)
    }

    if (type === "Quad") {
        const data: IUnitData = {
            speed: 1.0,
            health: 1.0,
        }
        return new Unit(scene, position, data, QuadView)
    }

    if (type === "Trike") {
        const data: IUnitData = {
            speed: 1.25,
            health: 0.75,
        }
        return new Unit(scene, position, data, TrikeView)
    }

    return type
}
