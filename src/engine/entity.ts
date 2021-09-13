let entityNextID = 0

export interface IEntity {
    readonly id: number
    name: string
}

export class Entity implements IEntity {
    private id_: number
    name: string

    constructor(name?: string) {
        this.id_ = entityNextID++
        this.name = name ?? `#${this.id_}`
    }

    get id(): number {
        return this.id_
    }
}
