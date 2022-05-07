import { createObservable, EventMap, IEmitter, IObservable } from "./event"

export type PropertyEventMap<Type> = {
    [Property in keyof Type as `${string & Property}Changed`]: Type[Property]
}

export class Model<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data extends Record<string, any>,
    Events extends EventMap = Record<string, never>
> {
    private data_: Data
    private emitter_: IEmitter<PropertyEventMap<Data> & Events>
    private events_: IObservable<PropertyEventMap<Data> & Events>

    constructor(data: Data) {
        const [emitter, events] = createObservable<PropertyEventMap<Data> & Events>()

        this.data_ = data
        this.emitter_ = emitter
        this.events_ = events
    }

    get events()
        : IObservable<PropertyEventMap<Data> & Events> {
        return this.events_
    }

    get<K extends string & keyof Data>(prop: K)
        : Data[K] {
        return this.data_[prop]
    }

    set<K extends string & keyof Data>(prop: K, value: Data[K])
        : Model<Data, Events> {
        this.data_[prop] = value
        this.emitter_.emit(
            `${prop}Changed`,
            value as unknown as (PropertyEventMap<Data> & Events)[`${K}Changed`]
        )
        return this
    }

    update(data: Partial<Data>)
        : Model<Data, Events> {
        for (const key of Object.keys(data) as (keyof Data)[]) {
            this.set(
                key as string & keyof Data,
                (data as Data)[key as string & keyof Data]
            )
        }
        return this
    }
}
