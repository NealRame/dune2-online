export type EventListenerCallback<EventType> = (event: EventType) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T

export type PropertyEventMap<Type> = {
    [Property in keyof Type as `${string & Property}Changed`]: Type[Property]
}

export interface IEmitter<T extends EventMap> {
    emit<K extends EventKey<T>>(eventName: K, eventData: T[K]): IEmitter<T>
}

export interface IObservable<T extends EventMap> {
    on<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IObservable<T>
    once<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IObservable<T>

    off<K extends EventKey<T>>(eventName: K): IObservable<T>
    off<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IObservable<T>

    clear(): IObservable<T>
}
