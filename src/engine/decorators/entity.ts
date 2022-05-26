import { chain } from "lodash"

import {
    type IEntity,
    type IEntityData,
    type IEntityEvents,
    type MapToIEntityMixins,
} from "@/engine/entity"

import {
    Service,
    ServiceLifecycle,
    type TConstructor,
} from "@/engine/injector"

import {
    type Image
} from "@/engine/scene"

export const EntityMetadataKey = Symbol("entity:metadata")

export interface IEntityTileProvider<
    Data extends IEntityData = IEntityData,
    Events extends IEntityEvents = IEntityEvents,
> {
    getTile(entity: IEntity<Data, Events>): Image | null
}

export interface IEntityMetadata<
    Data extends IEntityData = IEntityData,
    Events extends IEntityEvents = IEntityEvents,
    IMixins extends Array<Record<string, unknown>> = [],
> {
    EntityMixins: MapToIEntityMixins<Data, Events, IMixins>
    TileProvider: TConstructor<IEntityTileProvider<Data, Events>>
}

export function Entity(metadata: IEntityMetadata): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (target: Function) => {
        chain(target)
            .tap(Service({ lifecycle: ServiceLifecycle.Singleton }))
            .tap(target => {
                Reflect.defineMetadata(EntityMetadataKey, metadata, target)
            })
    }
}
