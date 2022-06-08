import { isNil } from "lodash"

import {
    type Token
} from "@/engine/injector"

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
    type IEntityData,
    type IEntityEvents,
    type IEntityLifecycleHooks,
    type IEntityMetadata,
    type IEntityTileProvider,
} from "./types"

import {
    EntityView,
} from "./view"
import { EntityDefinitionError } from "./errors"

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

        scene.addItem(this.view_)
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

    set x(x: number) {
        this.position_.x = x
    }

    get y(): number {
        return this.position_.y
    }

    set y(y: number) {
        this.position_.y = y
    }

    get emitter(): IEmitter<Events> {
        return this.emitter_
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

    static define<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>,
    >(
        id: Token<[Data, Events, IMixins]>,
        value: IEntityMetadata<Data, Events, IMixins>
    ): void {
        Reflect.defineProperty(window, id as symbol, {
            value
        })
    }

    static getMetadata<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>,
    >(id: Token<[Data, Events, IMixins]>)
        : IEntityMetadata<Data, Events, IMixins> {
        const metadata = Reflect.get(window, id as symbol)
        if (isNil(metadata)) {
            throw new EntityDefinitionError(id)
        }
        return metadata as unknown as IEntityMetadata<Data, Events, IMixins>
    }
}
