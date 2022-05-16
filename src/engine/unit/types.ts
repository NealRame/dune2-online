import {
    type IDestructibleData,
    type IDestructibleEvents,
    type IMovableData,
} from "@/engine/entity"

export type IUnitData = IDestructibleData & IMovableData

export type IUnitEvents = IDestructibleEvents
