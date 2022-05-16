import {
    type ISceneItem,
} from "@/engine/scene"

import {
    type IModel,
    type IModelData,
} from "@/engine/model"

import {
    type IEntity,
    type IEntityEvents,
    type IEntityController,
} from "./types"

export class Entity<
    Data extends IModelData,
    Events extends IEntityEvents,
> implements IEntity<Data, Events> {
    private static nextId_ = 0

    protected id_: number
    protected name_: string | undefined

    protected x_ = 0
    protected y_ = 0

    constructor(
        protected controller_: IEntityController<Data, Events>,
        protected model_: IModel<Data>,
        protected view_: ISceneItem,
    ) {
        this.id_ = Entity.nextId_++
        this.controller_.initialize(this)
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

    get controller(): IEntityController<Data, Events> {
        return this.controller_
    }

    get model(): IModel<Data> {
        return this.model_
    }

    get view(): ISceneItem {
        return this.view_
    }
}
