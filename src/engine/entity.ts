import { ISize, Vector } from "@/maths"
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

    readonly x: number
    readonly y: number
    readonly position: Vector

    readonly width: number
    readonly height: number
    readonly size: ISize

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

    get x(): number { return 0 }
    get y(): number { return 0 }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    get width(): number { return 0 }
    get height(): number { return 0 }

    get size(): ISize {
        return {
            width: this.width,
            height: this.height,
        }
    }

    abstract get view(): ISceneItem

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    update(): void { }
}
