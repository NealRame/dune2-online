import { createObservable, EventMap, IEmitter, IObservable } from "./event"

export type PropertyEventMap<Type> = {
    [Property in keyof Type as `${string & Property}Changed`]: Type[Property]
}

export class Model<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data extends Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Events extends EventMap = Record<string, any>
> {
    private data_: Data
    private events_: IObservable<PropertyEventMap<Data> & Events>

    protected emitter_: IEmitter<PropertyEventMap<Data> & Events>

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
}
