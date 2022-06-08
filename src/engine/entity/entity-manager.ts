
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
    type Token,
} from "@/engine/injector"

import {
    type TupleToIntersection,
} from "@/utils"

export interface IEntityManager {
    create<
        Data extends IEntityData,
        Events extends IEntityEvents,
        IMixins extends Array<unknown>,
    >(kind: Token<[Data, Events, IMixins]>):  IEntity<Data, Events> & TupleToIntersection<IMixins>
}

@Service({
    factoryFunction: (container: Container) => new EntityManager(container),
})
export class EntityManager implements IEntityManager {
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

        const scene = this.constainer_.get(GameScene)

        const hooks = this.constainer_.get(Hooks)
        const tilesProvider = this.constainer_.get(TileProvider)

        const entity = new Mixed(data, hooks, tilesProvider, scene)

        this.entities_.push(entity)

        return entity as unknown as IEntity<Data, Events> & TupleToIntersection<IMixins>
    }
}
