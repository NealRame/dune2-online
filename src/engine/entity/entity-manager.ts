import {
    GameMetadataKeys,
    GameScene,
} from "@/engine/constants"

import {
    type IEntityMetadata,
} from "@/engine/decorators"

import {
    Container,
    TConstructor,
} from "@/engine/injector"

import {
    Entity,
    type IEntity,
    type IEntityData,
    type IEntityEvents,
    type IEntityLifecycleHooks,
} from "@/engine/entity"

import {
    type TupleToIntersection,
} from "@/utils"

function getEntityMetadata<
    Data extends IEntityData = IEntityData,
    Events extends IEntityEvents = IEntityEvents,
    IMixins extends Array<unknown> = [],
>(target: TConstructor<IEntityLifecycleHooks<Data, Events, IMixins>>)
    : IEntityMetadata<Data, Events, IMixins> {
    return Reflect.getMetadata(GameMetadataKeys.entity, target)
}

export interface IEntityManager {
    create<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>
    >(EntityHooks: TConstructor<IEntityLifecycleHooks<Data, Events, IMixins>>): IEntity<Data, Events> & TupleToIntersection<IMixins>
    reset(): IEntityManager
}

export class EntityManager implements IEntityManager {
    constructor(protected container_: Container) {}

    create<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>,
    >(EntityHooks: TConstructor<IEntityLifecycleHooks<Data, Events, IMixins>>)
        : IEntity<Data, Events> & TupleToIntersection<IMixins> {
        const { data, Mixins, TileProvider } = getEntityMetadata(EntityHooks)

        const Mixed = Mixins.reduce(
            (Mixed, Mixin) => Mixin(Mixed),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Entity as any,
        )

        const hooks = this.container_.get(EntityHooks)
        const scene = this.container_.get(GameScene)
        const tileProvider = new TileProvider()

        const entity = new Mixed(data, tileProvider, hooks, scene)

        return entity
    }

    reset()
        : this {
        return this
    }
}
