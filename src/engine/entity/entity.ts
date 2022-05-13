import {
    type IScene,
} from "@/engine/scene"

import {
    createObservable,
    type IEmitter,
    type IObservable,
    type EventMap,
} from "@/utils/event"

import {
    type IEntity
} from "./types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IEntityData = Record<string, any>

export type IEntityDataEvents<Data extends IEntityData> = {
    [K in keyof Data as `${string & K}Changed`]: Data[K]
}

type EntityEvents<
    Data extends IEntityData,
    ExtraEvents extends EventMap,
> = IEntityDataEvents<Data> & ExtraEvents & {
    update: undefined
}

export class Entity<
    Data extends IEntityData,
    ExtraEvents extends EventMap = Record<string, never>
> implements IEntity {
    private static nextId_ = 0

    protected scene_: IScene

    protected data_: Data

    protected id_: number
    protected name_: string | undefined

    protected x_ = 0
    protected y_ = 0

    protected events_: IObservable<EntityEvents<Data, ExtraEvents>>
    protected emitter_:   IEmitter<EntityEvents<Data, ExtraEvents>>

    constructor(data: Data, scene: IScene) {
        const [emitter, events] = createObservable<EntityEvents<Data, ExtraEvents>>()

        this.data_ = data
        this.emitter_ = emitter
        this.events_ = events

        this.id_ = Entity.nextId_++
        this.scene_ = scene
    }

    get events()
        : IObservable<EntityEvents<Data, ExtraEvents>> {
        return this.events_
    }

    get id(): number {
        return this.id_
    }

    get name(): string {
        return this.name_ ?? `${this.constructor.name}#${this.id}`
    }

    set name(name: string) {
        this.name_ = name
    }

    get x(): number {
        return this.x_
    }

    get y(): number {
        return this.y_
    }

    get<K extends string & keyof Data>(prop: K)
        : Data[K] {
        return this.data_[prop]
    }

    set<K extends string & keyof Data>(prop: K, value: Data[K])
        : this {
        this.data_[prop] = value
        this.emitter_.emit(
            `${prop}Changed`,
            value as unknown as EntityEvents<Data, ExtraEvents>[`${K}Changed`]
        )
        return this
    }
}
