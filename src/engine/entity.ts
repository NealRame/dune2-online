import { ISceneItem } from "./scene"

import { Vector } from "@/maths"

export const entityId = (function * () {
    let id = 0
    while (true) {
        yield ++id
    }
})()

export interface IEntity {
    name: string

    readonly id: number

    readonly x: number
    readonly y: number
    readonly position: Vector

    readonly view: ISceneItem

    update(): IEntity
}

export abstract class Entity implements IEntity {
    private id_: number
    name: string

    constructor(name?: string) {
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

    update(): IEntity {
        return this
    }

    abstract get view(): ISceneItem
}
