import { QuadSprite } from "./quad"
import { HarvesterSprite } from "./harvester"
import { TrikeSprite } from "./trike"

import * as Engine from "@/engine"
import { IVector2D } from "@/maths"
import { IUnitData } from "@/engine"

export class Unit extends Engine.Unit {
    private view_: Engine.Sprite

    constructor(
        scene: Engine.IScene,
        position: IVector2D,
        data: Engine.IUnitData,
        View: new (scene: Engine.IScene, unit: Unit) => Engine.Sprite,
    ) {
        super(scene, data)
        this.x_ = position.x
        this.y_ = position.y
        this.view_ = new View(scene, this)
        this.events.listen("directionChanged", () => {
            this.view_.frameIndex = this.direction
        })
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
        return new Unit(scene, position, data, HarvesterSprite)
    }

    if (type === "Quad") {
        const data: IUnitData = {
            speed: 1.0,
            health: 1.0,
        }
        return new Unit(scene, position, data, QuadSprite)
    }

    if (type === "Trike") {
        const data: IUnitData = {
            speed: 1.25,
            health: 0.75,
        }
        return new Unit(scene, position, data, TrikeSprite)
    }

    return type
}
