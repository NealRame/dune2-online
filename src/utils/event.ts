export type EventListenerCallback<EventType> = (event: EventType) => void
// export type EventListenerCancelCallback = () => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T

export interface IEmitter<T extends EventMap> {
    emit<K extends EventKey<T>>(eventName: K, eventData: T[K]): IEmitter<T>

    on<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IEmitter<T>
    once<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IEmitter<T>

    off<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IEmitter<T>

    clear(): IEmitter<T>
}
