import { IEntity } from "@/engine/entity"
import { Direction, Vector } from "@/maths"
import { IObservable } from "@/utils"

export interface IUnitData {
    health: number
    speed: number
}

export interface IUnitEvent<Data extends IUnitData> {
    changed: IUnit<Data>
    destroyed: IUnit<Data>
    directionChanged: IUnit<Data>
    destinationReached: IUnit<Data>
}

export interface IUnit<
    Data extends IUnitData = IUnitData,
    Events extends IUnitEvent<Data> = IUnitEvent<Data>,
> extends IEntity {
    readonly data: Data
    readonly events: IObservable<Events>
    readonly position: Vector

    move(direction: Direction): IUnit<Data>
    set(data: Partial<Data>): IUnit<Data>
}
