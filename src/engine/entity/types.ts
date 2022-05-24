import {
    type IModel,
    type IModelData,
} from "@/engine/model"

import {
    type ISceneItem,
} from "@/engine/scene"

import {
    Direction,
    type IVector2D,
} from "@/maths"
import { IEmitter, IObservable } from "@/utils"

export type IEntityData = IModelData

export interface IEntityEvents {
    destroyed: undefined
    update: undefined
    ready: undefined
}

export interface IEntityLifecycleHooks<
    Data extends IEntityData,
    Events extends IEntityEvents = IEntityEvents,
> {
    onDestroyed?(model: IModel<Data>, emitter: IEmitter<Events>, events: IObservable<Events>): void
    onInitialized?(model: IModel<Data>, emitter: IEmitter<Events>, events: IObservable<Events>): void
}

export interface IEntity<
    ModelData extends IModelData,
    Events extends IEntityEvents,
> extends Readonly<IVector2D> {
    readonly id: number

    name: string

    readonly events: IObservable<Events>
    readonly model: IModel<ModelData>
    readonly view: ISceneItem
}

export interface IDestructibleData {
    health: number
}

export interface IDestructibleEvents {
    destroyed: undefined
}

export interface IMovableData {
    direction: Direction
    speed: number
}

export interface IMovableEvents {
    destinationReached: IVector2D
}

export interface IMovable {
    move(direction: Direction): void
}
