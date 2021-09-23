export type EventListenerCallback<EventType> = (event: EventType) => void
export type EventListenerCancelCallback = () => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T

export interface IEmitter<T extends EventMap> {
    emit<K extends EventKey<T>>(eventName: K, eventData: T[K]): IEmitter<T>
    listen<K extends EventKey<T>>(eventName: K, receiver: EventListenerCallback<T[K]>): EventListenerCancelCallback
    on<K extends EventKey<T>>(eventName: K): IEmitter<T>
    off<K extends EventKey<T>>(eventName: K): IEmitter<T>
}

export interface IObserver<EventType> {
    publish(event: EventType): void,
    subscribe(callback: EventListenerCallback<EventType>): EventListenerCancelCallback,
}
