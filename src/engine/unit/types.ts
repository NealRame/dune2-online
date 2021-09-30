import { IEntity } from "@/engine/entity"
import { Direction, Vector } from "@/maths"

export interface IUnitData {
    health: number
    speed: number
}

export interface IUnitEvent<Data extends IUnitData> {
    changed: IUnit<Data>
    destroyed: IUnit<Data>
    destinationReached: IUnit<Data>
}

export interface IUnit<Data extends IUnitData = IUnitData> extends IEntity<IUnitEvent<Data>> {
    readonly data: Data
    readonly position: Vector

    move(direction: Direction): IUnit<Data>
    set(data: Partial<Data>): IUnit<Data>
}
