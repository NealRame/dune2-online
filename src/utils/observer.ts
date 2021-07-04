export type EventCallback<EventType> = (event: EventType) => void

export interface Observer<EventType> {
    publish(event: EventType): void,
    subscribe(callback: EventCallback<EventType>): () => void,
}

export function createObserver<EventType>()
    : Observer<EventType> {
    let callbacks: EventCallback<EventType>[] = []
    return {
        publish(event: EventType) {
            for (const callback of callbacks) {
                callback(event)
            }
        },
        subscribe(callback: EventCallback<EventType>) {
            callbacks.push(callback)
            return () => {
                callbacks = callbacks.filter(l => l !== callback)
            }
        },
    }
}
