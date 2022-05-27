import { isNil } from "lodash"

import {
    createModel,
    type IModel,
    type IModelData,
} from "@/engine/model"

import {
    type IScene,
    type ISceneItem,
} from "@/engine/scene"

import {
    Vector,
} from "@/maths"

import {
    createObservable,
    type IEmitter,
    type IObservable,
} from "@/utils"

import {
    type IEntity,
    type IEntityEvents,
    type IEntityLifecycleHooks,
    type IEntityTileProvider,
} from "./types"

import {
    EntityView,
} from "./view"

let EntityNextID = 0

export class Entity<
    Data extends IModelData,
    Events extends IEntityEvents,
> implements IEntity<Data, Events> {
    protected id_: number

    protected events_: IObservable<Events>
    protected emitter_: IEmitter<Events>

    protected name_: string | undefined
    protected position_ = Vector.Zero

    protected hooks_: IEntityLifecycleHooks<Data, Events>
    protected model_: IModel<Data>
    protected view_: ISceneItem

    constructor(
        data: Data,
        hooks: IEntityLifecycleHooks<Data, Events>,
        tileProvider: IEntityTileProvider<Data>,
        scene: IScene,
    ) {
        this.id_ = EntityNextID++

        const [emitter, events] = createObservable<Events>()

        this.emitter_ = emitter
        this.events_ = events

        this.hooks_ = hooks
        this.model_ = createModel(data)
        this.view_ = new EntityView(this, tileProvider, scene)

        if (!isNil(this.hooks_.onInitialized)) {
            this.hooks_.onInitialized(this.model_, this.emitter_, this.events_)
        }
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
        return this.position_.x
    }

    get y(): number {
        return this.position_.y
    }

    get events(): IObservable<Events> {
        return this.events_
    }

    get model(): IModel<Data> {
        return this.model_
    }

    get view(): ISceneItem {
        return this.view_
    }
}
