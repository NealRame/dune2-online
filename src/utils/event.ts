import { isNil } from "lodash"

export type EventListenerCallback<EventType> = (event: EventType) => void

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventMap = Record<string, any>
export type EventKey<T extends EventMap> = string & keyof T

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

export function createObservable<T extends EventMap>()
    : [IEmitter<T>, IObservable<T>] {
    let handlers: { [K in keyof T]?: Array<EventListenerCallback<T[K]>> } = {}
    let handlersOnce: { [K in keyof T]?: Array<EventListenerCallback<T[K]>> } = {}

    return [{
        emit<K extends EventKey<T>>(
            eventName: K,
            data: T[K]
        ): IEmitter<T> {
            const eventHandlers = handlers[eventName]
            if (!isNil(eventHandlers)) {
                eventHandlers.forEach(l => l(data))
            }

            const eventHandlersOnce = handlersOnce[eventName]
            if (!isNil(eventHandlersOnce)) {
                eventHandlersOnce.forEach(l => l(data))
            }
            delete handlersOnce[eventName]

            return this
        }
    }, {
        on<K extends EventKey<T>>(
            eventName: K,
            callback: EventListenerCallback<T[K]>,
        ): IObservable<T> {
            type ListenerList = Array<EventListenerCallback<T[K]>>

            if (!(eventName in handlers)) {
                handlers[eventName] = []
            }
            (handlers[eventName] as ListenerList).push(callback)

            return this
        },
        once<K extends EventKey<T>>(
            eventName: K,
            callback: EventListenerCallback<T[K]>,
        ): IObservable<T> {
            type ListenerList = Array<EventListenerCallback<T[K]>>

            if (!(eventName in handlersOnce)) {
                handlersOnce[eventName] = []
            }
            (handlersOnce[eventName] as ListenerList).push(callback)

            return this
        },
        off<K extends EventKey<T>>(
            eventName: K,
            callback?: EventListenerCallback<T[K]>,
        ): IObservable<T> {
            if (!isNil(callback)) {
                const eventHandlers = handlers[eventName]
                if (!isNil(eventHandlers)) {
                    const index = eventHandlers.indexOf(callback)
                    if (index >= 0) {
                        eventHandlers.splice(index, 1)
                    }
                }
                const eventHandlersOnce = handlersOnce[eventName]
                if (!isNil(eventHandlersOnce)) {
                    const index = eventHandlersOnce.indexOf(callback)
                    if (index >= 0) {
                        eventHandlersOnce.splice(index, 1)
                    }
                }
            } else {
                delete handlers[eventName]
                delete handlersOnce[eventName]
            }
            return this
        },
        clear(): IObservable<T> {
            handlersOnce = {}
            handlers = {}
            return this
        }
    }]
}

export interface IDOMEventManager {
    start(): void
    stop(): void
}

export function createEventManager<K extends keyof HTMLElementEventMap>(
    element: HTMLElement | Window,
    type: K,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions | undefined
): IDOMEventManager {
    return {
        start() {
            element.addEventListener(type, listener, options)
        },
        stop() {
            element.removeEventListener(type, listener, options)
        }
    }
}
