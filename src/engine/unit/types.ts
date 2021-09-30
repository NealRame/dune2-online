import { IEntity } from "@/engine/entity"
import { Direction, Vector } from "@/maths"
import { IEmitter } from "@/utils"

export interface IUnitData {
    health: number
    speed: number
}

export interface IUnitEvent<Data extends IUnitData> {
    changed: IUnit<Data>
    destroyed: IUnit<Data>
    destinationReached: IUnit<Data>
}

export interface IUnit<Data extends IUnitData = IUnitData> extends IEntity {
    readonly data: Data
    readonly events: IEmitter<IUnitEvent<Data>>
    readonly position: Vector

    move(direction: Direction): IUnit<Data>
    set(data: Partial<Data>): IUnit<Data>
}
