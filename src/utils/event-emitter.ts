import {
    EventKey,
    EventMap,
    EventListenerCallback,
    IEmitter,
} from "./event"

import { isNil } from "lodash"

export class EventEmitter<T extends EventMap> implements IEmitter<T> {
    private handlers_: {
        [K in keyof T]?: Array<EventListenerCallback<T[K]>>
    } = {}

    private handlersOnce_: {
        [K in keyof T]?: Array<EventListenerCallback<T[K]>>
    } = {}

    emit<K extends EventKey<T>>(
        eventName: K,
        data: T[K]
    ): EventEmitter<T> {
        const eventHandlers = this.handlers_[eventName]
        if (!isNil(eventHandlers)) {
            eventHandlers.forEach(l => l(data))
        }

        const eventHandlersOnce = this.handlersOnce_[eventName]
        if (!isNil(eventHandlersOnce)) {
            eventHandlersOnce.forEach(l => l(data))
        }
        delete this.handlersOnce_[eventName]

        return this
    }

    on<K extends EventKey<T>>(
        eventName: K,
        callback: EventListenerCallback<T[K]>,
    ): EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        if (!(eventName in this.handlers_)) {
            this.handlers_[eventName] = []
        }
        (this.handlers_[eventName] as ListenerList).push(callback)

        return this
    }

    once<K extends EventKey<T>>(
        eventName: K,
        callback: EventListenerCallback<T[K]>,
    ): EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        if (!(eventName in this.handlersOnce_)) {
            this.handlersOnce_[eventName] = []
        }
        (this.handlersOnce_[eventName] as ListenerList).push(callback)

        return this
    }

    off<K extends EventKey<T>>(eventName: K): IEmitter<T>
    off<K extends EventKey<T>>(eventName: K, callback: EventListenerCallback<T[K]>): IEmitter<T>
    off<K extends EventKey<T>>(
        eventName: K,
        callback?: EventListenerCallback<T[K]>,
    ): EventEmitter<T> {
        if (!isNil(callback)) {
            const eventHandlers = this.handlers_[eventName]
            if (!isNil(eventHandlers)) {
                const index = eventHandlers.indexOf(callback)
                if (index >= 0) {
                    eventHandlers.splice(index, 1)
                }
            }
            const eventHandlersOnce = this.handlersOnce_[eventName]
            if (!isNil(eventHandlersOnce)) {
                const index = eventHandlersOnce.indexOf(callback)
                if (index >= 0) {
                    eventHandlersOnce.splice(index, 1)
                }
            }
        } else {
            delete this.handlers_[eventName]
            delete this.handlersOnce_[eventName]
        }
        return this
    }

    clear(): EventEmitter<T> {
        this.handlersOnce_ = {}
        this.handlers_ = {}
        return this
    }
}
