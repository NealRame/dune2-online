import {
    createObservable,
    type IObservable,
} from "@/utils"

export type IModelData = Record<string, any>

export type IModelDataEvents<Data extends IModelData> = {
    [K in keyof Data as `${string & K}Changed`]: Data[K]
}

export type IModelEventMap<Type> = {
    [Property in keyof Type as `${string & Property}Changed`]: Type[Property]
}

export interface IModel<Data extends IModelData> extends IObservable<IModelEventMap<Data>> {
    get<K extends string & keyof Data>(prop: K): Data[K]
    set<K extends string & keyof Data>(prop: K, value: Data[K]): IModel<Data>
}

export function createModel<Data extends IModelData>(data: Data)
    : IModel<Data> {
    const [emitter, events] = createObservable<IModelDataEvents<Data>>()
    return {
        ...events,
        get<K extends string & keyof Data>(prop: K)
            : Data[K] {
            return data[prop]
        },
        set<K extends string & keyof Data>(prop: K, value: Data[K])
            : IModel<Data> {
            data[prop] = value
            emitter.emit(
                `${prop}Changed`,
                value as unknown as (IModelDataEvents<Data>)[`${K}Changed`]
            )
            return this
        }
    }
}
