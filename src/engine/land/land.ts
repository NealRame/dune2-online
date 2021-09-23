import { Terrain } from "./terrain"
import {
    ILand,
    ILandEvent,
    ITerrainData,
    ITerrain,
    Neighborhood,
    LandInitialData,
    TileIndexGetter
} from "./types"
import {
    createPositionToIndexConverter,
    createIndexToPositionConverter,
    PositionToIndexConverter,
    IndexToPositionConverter,
} from "./utils"
import { LandView } from "./view"

import { Entity } from "@/engine/entity"
import { Image, IScene, ISceneItem } from "@/engine/scene"

import { ISize, IVector2D, Rect } from "@/maths"

import { constant, isNil, times } from "lodash"

export class LandDataError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandDataError.prototype)
    }
}

export class Land<TerrainData extends ITerrainData> extends Entity<ILandEvent<TerrainData>> implements ILand<TerrainData> {
    private terrains_: Array<Terrain<TerrainData>> = []
    private view_: LandView<TerrainData>

    private size_: ISize
    private indexToPosition_: IndexToPositionConverter
    private positionToIndex_: PositionToIndexConverter

    chunkSize = { width: 16, height: 16 }
    fogImage: TileIndexGetter<TerrainData> = constant(-1)
    terrainImage: TileIndexGetter<TerrainData> = constant(-1)
    tiles: Array<Image> = []

    constructor(
        scene: IScene,
        landData: LandInitialData<TerrainData>,
    ) {
        super()

        this.size_ = scene.size
        this.indexToPosition_ = createIndexToPositionConverter(this.size_)
        this.positionToIndex_ = createPositionToIndexConverter(this.size_)

        this.terrains_ = times(this.size_.width*this.size_.height, index => {
            const position = this.indexToPosition_(index)
            const data = (typeof landData === "function")
                ? landData(position)
                : landData[index]

            if (isNil(data)) {
                throw new LandDataError("Not enougth data to cover land area!")
            }
            return new Terrain(position, data, this)
        })
        this.view_ = new LandView(this, scene)
    }

    get size(): ISize {
        return this.size_
    }

    get view(): ISceneItem {
        return this.view_
    }

    reveal(position: IVector2D, size?: ISize): this {
        size = size ?? { width: 1, height: 1 }
        for (const terrain of this.terrains(new Rect(position, size))) {
            terrain.update({ revealed: true } as Partial<TerrainData>)
        }
        return this
    }

    terrain(position: IVector2D)
        : ITerrain<TerrainData>|null {
        return this.terrains_[this.positionToIndex_(position)] ?? null
    }

    neighborhood({ x, y }: IVector2D)
        : Neighborhood<TerrainData> {
        return [
            this.terrain({ x, y: y - 1 }),
            this.terrain({ x: x + 1, y }),
            this.terrain({ x, y: y + 1 }),
            this.terrain({ x: x - 1, y }),
        ]
    }

    * terrains(zone?: Rect)
        : Generator<ITerrain<TerrainData>, void, undefined> {
        if (!isNil(zone)) {
            const rect = this.view.rect.intersected(zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as ITerrain<TerrainData>
                }
            }
        } else {
            yield * this.terrains_
        }
    }
}
