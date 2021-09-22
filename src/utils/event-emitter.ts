import {
    EventKey,
    EventMap,
    EventListenerCallback,
    EventListenerCancelCallback,
    IEmitter,
} from "./event"

import { isNil } from "lodash"

export class EventEmitter<T extends EventMap> implements IEmitter<T> {
    private events_: {
        [K in keyof T]?: {
            muted: boolean,
            listeners: Array<EventListenerCallback<T[K]>>
        }
    } = {}

    protected emit_<K extends EventKey<T>>(
        eventName: K,
        data: T[K]
    ): EventEmitter<T> {
        const event = this.events_[eventName]
        if (!(isNil(event) || event.muted)) {
            event.listeners.forEach(l => l(data))
        }
        return this
    }

    listen<K extends EventKey<T>>(
        eventName: K,
        listener: EventListenerCallback<T[K]>,
    ): EventListenerCancelCallback {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.events_[eventName] = this.events_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).listeners.push(listener)

        return () => {
            const event = this.events_[eventName]
            if (!isNil(event)) {
                event.listeners = event.listeners.filter(l => l !== listener)
            }
        }
    }

    on<K extends EventKey<T>>(eventName: K)
        : EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.events_[eventName] = this.events_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).muted = false

        return this
    }

    off<K extends EventKey<T>>(eventName: K)
        : EventEmitter<T> {
        type ListenerList = Array<EventListenerCallback<T[K]>>

        (this.events_[eventName] = this.events_[eventName] ?? {
            muted: false,
            listeners: [] as ListenerList
        }).muted = true

        return this
    }
}
