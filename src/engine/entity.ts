export const entityId = (function * () {
    let id = 0
    while (true) {
        yield ++id
    }
})()

export interface IEntity {
    readonly id: number
    name: string
}

export class Entity implements IEntity {
    private id_: number
    name: string

    constructor(name?: string) {
        this.id_ = entityId.next().value
        this.name = name ?? `#${this.id_}`
    }

    get id(): number {
        return this.id_
    }
}
