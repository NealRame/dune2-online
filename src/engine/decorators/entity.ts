import {
    Service,
    ServiceLifecycle,
} from "@/engine/injector"

import { chain } from "lodash"

import { TConstructor } from "../injector/types"

import { IEntity, IEntityData, IEntityEvents } from "../entity"
import { Image } from "../scene"

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
> {
    TileProvider: TConstructor<IEntityTileProvider<Data, Events>>
}

export function Entity(): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (target: Function) => {
        chain(target)
            .tap(Service({ lifecycle: ServiceLifecycle.Singleton }))
            .tap(target => {
                Reflect.defineMetadata(EntityMetadataKey, {}, target)
            })
    }
}
