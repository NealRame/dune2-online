import {
    type IScene,
    type ISceneItem
} from "./scene"
import { type IEntity } from "./types"

import { EventMap, Model } from "@/utils"

export abstract class Entity<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data extends Record<string, any>,
    Events extends EventMap = Record<string, never>
> extends Model<Data, Events> implements IEntity {
    private static nextId_ = 0

    private id_: number
    private name_: string | undefined

    protected scene_: IScene

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

    abstract get view(): ISceneItem
}
