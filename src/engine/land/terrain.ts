import { ITerrain, ITerrainData } from "./types"

import { IVector2D } from "@/maths"

type ChangesNotifier<Data extends ITerrainData> = (t: ITerrain<Data>) => void

export class Terrain<Data extends ITerrainData> implements ITerrain<Data> {
    private position_: IVector2D
    private data_: Data
    private notify_: ChangesNotifier<Data>

    constructor(
        position: IVector2D,
        data: Data,
        notify: ChangesNotifier<Data>
    ) {
        this.position_ = position
        this.data_ = data
        this.notify_ = notify
    }

    get data(): Data {
        return this.data_
    }

    get position(): IVector2D {
        return this.position_
    }

    update(data: Partial<Data>): this {
        Object.assign(this.data_, data)
        this.notify_(this)
        return this
    }
}
