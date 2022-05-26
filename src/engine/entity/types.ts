import {
    type TConstructor,
} from "@/engine/injector"

import {
    type IModel,
    type IModelData,
} from "@/engine/model"

import {
    type Image,
    type ISceneItem,
} from "@/engine/scene"

import {
    Direction,
    type IVector2D,
} from "@/maths"

import {
    type IEmitter,
    type IObservable
} from "@/utils"

export type IEntityData = IModelData

export interface IEntityEvents {
    destroyed: undefined
    update: undefined
    ready: undefined
}

export interface IEntityTileProvider<
    Data extends IEntityData = IEntityData,
    Events extends IEntityEvents = IEntityEvents,
> {
    getTile(entity: IEntity<Data, Events>): Image | null
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

export interface IEntityLifecycleHooks<
    Data extends IEntityData,
    Events extends IEntityEvents = IEntityEvents,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    IMixins extends Array<Record<string, unknown>> = [],
> {
    onDestroyed?(model: IModel<Data>, emitter: IEmitter<Events>, events: IObservable<Events>): void
    onInitialized?(model: IModel<Data>, emitter: IEmitter<Events>, events: IObservable<Events>): void
}

export type IEntityMixin<
    Data extends IEntityData,
    Events extends IEntityEvents,
    IMixin extends Record<string, unknown>,
> = (base: TConstructor<IEntity<Data, Events>>) => TConstructor<IEntity<Data, Events> & IMixin>

export type MapToIEntityMixins<
    Data extends IEntityData,
    Events extends IEntityEvents,
    IMixins extends Array<Record<string, unknown>>,
> = {
    [K in keyof IMixins]: K extends number
        ? IEntityMixin<Data, Events, IMixins[K]>
        : never
} & { length: IMixins["length"] }

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
