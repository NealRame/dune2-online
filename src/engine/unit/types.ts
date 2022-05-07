import {
    type IPositionableData,
    type IDestructibleData,
} from "@/engine/types"

export interface IUnitData extends
    IPositionableData,
    IDestructibleData {}

export interface IUnitEvents {
    "destroyed": void,
}
