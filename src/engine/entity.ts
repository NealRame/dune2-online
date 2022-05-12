import {
    type IScene,
} from "./scene"
import { type IEntity } from "./types"

import {
    createObservable,
    type IEmitter,
    type IObservable,
    type EventMap,
} from "@/utils/event"

export type PropertyEventMap<Type> = {
    [Property in keyof Type as `${string & Property}Changed`]: Type[Property]
}

export class Entity<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data extends Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Events extends EventMap = Record<string, any>
> implements IEntity {
    private static nextId_ = 0

    protected scene_: IScene

    protected data_: Data

    protected id_: number
    protected name_: string | undefined

    protected x_ = 0
    protected y_ = 0

    protected events_: IObservable<PropertyEventMap<Data> & Events>
    protected emitter_: IEmitter<PropertyEventMap<Data> & Events>

    constructor(data: Data, scene: IScene) {
        const [emitter, events] = createObservable<PropertyEventMap<Data> & Events>()

        this.data_ = data
        this.emitter_ = emitter
        this.events_ = events

        this.id_ = Entity.nextId_++
        this.scene_ = scene
    }

    get events()
        : IObservable<PropertyEventMap<Data> & Events> {
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
            value as unknown as (PropertyEventMap<Data> & Events)[`${K}Changed`]
        )
        return this
    }
}
