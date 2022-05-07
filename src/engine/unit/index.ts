import {
    type IUnitData,
    type IUnitEvents,
} from "./types"

import {
    Entity
} from "@/engine/entity"

export abstract class Unit<
    Data extends IUnitData = IUnitData,
    Events extends IUnitEvents = IUnitEvents
> extends Entity<Data, Events> {}
