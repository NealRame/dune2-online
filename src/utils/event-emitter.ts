import {
    EventKey,
    EventMap,
    EventListenerCallback,
    EventListenerCancelCallback,
    IEmitter,
} from "./event"

import { isNil } from "lodash"

export class EventEmitter<T extends EventMap> implements IEmitter<T> {
    private handlers_: {
        [K in keyof T]?: {
            muted: boolean,
            listeners: Array<EventListenerCallback<T[K]>>
        }
    } = {}

    private cancelers_: {
        [K in keyof T]?: Array<EventListenerCancelCallback>
    } = {}

    emit<K extends EventKey<T>>(
        eventName: K,
        data: T[K]
    ): EventEmitter<T> {
        const handlers = this.handlers_[eventName]
        if (!(isNil(handlers) || handlers.muted)) {
            handlers.listeners.forEach(l => l(data))
        }

        const cancelers = this.cancelers_[eventName]
        if (!isNil(cancelers)) {
            cancelers.forEach(cb => cb())
            this.cancelers_[eventName] = []
        }

        return this
    }

    listen<K extends EventKey<T>>(
        eventName: K,
        listener: EventListenerCallback<T[K]>,
    ): EventListenerCancelCallback {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.handlers_[eventName] = this.handlers_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).listeners.push(listener)

        return () => {
            const event = this.handlers_[eventName]
            if (!isNil(event)) {
                event.listeners = event.listeners.filter(l => l !== listener)
            }
        }
    }

    listenOnce<K extends EventKey<T>>(
        eventName: K,
        listener: EventListenerCallback<T[K]>,
    ): EventListenerCancelCallback {
        type CancelerList = Array<EventListenerCancelCallback>

        const cancelers = this.cancelers_[eventName] = this.cancelers_[eventName] ?? [] as CancelerList
        const canceler = this.listen(eventName, listener)

        cancelers.push(canceler)

        return canceler
    }

    on<K extends EventKey<T>>(eventName: K)
        : EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.handlers_[eventName] = this.handlers_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).muted = false

        return this
    }

    off<K extends EventKey<T>>(eventName: K)
        : EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.handlers_[eventName] = this.handlers_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).muted = true

        return this
    }
}
