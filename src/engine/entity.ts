import { EventEmitter, EventMap, IEmitter } from "@/utils"
import { ISceneItem } from "."

export const entityId = (function * () {
    let id = 0
    while (true) {
        yield ++id
    }
})()

export interface IEntity<
    Events extends EventMap = Record<string, unknown>
> extends IEmitter<Events> {
    name: string
    readonly id: number
    readonly view: ISceneItem
    update(): void
}

export abstract class Entity<
    Events extends EventMap = Record<string, unknown>
> extends EventEmitter<Events> implements IEntity<Events> {
    private id_: number
    name: string

    constructor(name?: string) {
        super()
        this.id_ = entityId.next().value
        this.name = name ?? `#${this.id_}`
    }

    get id(): number {
        return this.id_
    }

    abstract get view(): ISceneItem

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update(): void { }
}
