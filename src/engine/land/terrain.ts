import { Land } from "./land"
import { ITerrain, ITerrainData } from "./types"

import { IVector2D } from "@/maths"

export class Terrain<Data extends ITerrainData> implements ITerrain<Data> {
    private land_: Land<Data>
    private position_: IVector2D
    private data_: Data

    constructor(
        position: IVector2D,
        data: Data,
        land: Land<Data>,
    ) {
        this.position_ = position
        this.data_ = data
        this.land_ = land
    }

    get data(): Data {
        return this.data_
    }

    get position(): IVector2D {
        return this.position_
    }

    update(data: Partial<Data>): this {
        Object.assign(this.data_, data)
        this.land_.emit("terrainChanged", this)
        return this
    }
}
