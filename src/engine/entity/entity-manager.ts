
import {
    GameScene,
} from "@/engine/constants"

import {
    Entity,
    type IEntityData,
    type IEntityEvents,
    type IEntity,
} from "@/engine/entity"

import {
    Container,
    Service,
    ServiceLifecycle,
    type Token,
} from "@/engine/injector"

import {
    type TupleToIntersection,
} from "@/utils"

@Service({
    lifecycle: ServiceLifecycle.Singleton,
    factoryFunction: (container: Container) => new EntityManager(container),
})
export class EntityManager {
    private entities_: Array<IEntity> = []

    constructor(private constainer_: Container) {}

    public create<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>,
    >(kind: Token<[Data, Events, IMixins]>)
        : IEntity<Data, Events> & TupleToIntersection<IMixins> {
        const { data, Hooks, Mixins, TileProvider } = Entity.getMetadata(kind)

        const Mixed = Mixins.reduce(
            (Mixed, Mixin) => Mixin(Mixed),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Entity as any,
        )

        const hooks = this.constainer_.get(Hooks)
        const tilesProvider = this.constainer_.get(TileProvider)
        const scene = this.constainer_.get(GameScene)

        const entity = new Mixed(data, tilesProvider, hooks, scene)

        return entity as unknown as IEntity<Data, Events> & TupleToIntersection<IMixins>
    }
}
