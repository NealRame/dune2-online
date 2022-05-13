import {
    type ISceneItem,
} from "@/engine/scene"

import {
    Direction,
    type IVector2D,
} from "@/maths"

export interface IEntity {
    readonly id: number
    name: string

    readonly x: number
    readonly y: number

    readonly view?: ISceneItem
}

export interface IDestructibleData {
    health: number
}

export interface IMovableData {
    direction: Direction
    speed: number
}

export interface IDestructibleEvents {
    "destroyed": undefined
}

export interface IMovableEvents {
    "destinationReached": IVector2D
}

export interface IMovable {
    move(direction: Direction): void
}
