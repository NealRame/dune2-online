import {
    type IScene,
} from "./scene"
import { type IEntity } from "./types"

import { EventMap, Model } from "@/utils"

export class Entity<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data extends Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Events extends EventMap = Record<string, any>
> extends Model<Data, Events> implements IEntity {
    private static nextId_ = 0

    protected scene_: IScene

    protected id_: number
    protected name_: string | undefined

    protected x_ = 0
    protected y_ = 0

    constructor(data: Data, scene: IScene) {
        super(data)
        this.id_ = Entity.nextId_++
        this.scene_ = scene
    }

    get id(): number {
        return this.id_
    }

    get name(): string {
        return this.name_ ?? `${this.constructor.name}#${this.id}`
    }

    set name(name: string) {
        this.name_ = name
    }

    get x(): number {
        return this.x_
    }

    get y(): number {
        return this.y_
    }
}
