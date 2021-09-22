import { EventListenerCallback, IObserver } from "./event"

export function createObserver<EventType>()
    : IObserver<EventType> {
    let callbacks: EventListenerCallback<EventType>[] = []
    return {
        publish(event: EventType) {
            for (const callback of callbacks) {
                callback(event)
            }
        },
        subscribe(callback: EventListenerCallback<EventType>) {
            callbacks.push(callback)
            return () => {
                callbacks = callbacks.filter(l => l !== callback)
            }
        },
    }
}
