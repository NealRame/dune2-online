import { chain } from "lodash"

import {
    GameMetadataKeys
} from "@/engine/constants"

import {
    type IEntityData,
    type IEntityEvents,
    type IEntityTileProvider,
    type MapToIEntityMixins,
} from "@/engine/entity"

import {
    Service,
    ServiceLifecycle,
    type TConstructor,
} from "@/engine/injector"

export interface IEntityMetadata<
    Data extends IEntityData = IEntityData,
    Events extends IEntityEvents = IEntityEvents,
    IMixins extends Array<unknown> = [],
> {
    data: Data
    Mixins: MapToIEntityMixins<Data, Events, IMixins>
    TileProvider: TConstructor<IEntityTileProvider<Data>>
}

export function Entity(metadata: IEntityMetadata)
    : ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (target: Function) => {
        chain(target)
            .tap(Service({ lifecycle: ServiceLifecycle.Singleton }))
            .tap(target => {
                Reflect.defineMetadata(GameMetadataKeys.entity, metadata, target)
            })
    }
}
