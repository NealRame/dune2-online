import { Chunk } from "./chunk"
import { Terrain } from "./terrain"
import {
    ILand,
    ITerrainData,
    ITerrain,
    Neighborhood,
    LandInitialData
} from "./types"
import {
    createPositionToIndexConverter,
    createIndexToPositionConverter,
    PositionToIndexConverter,
    IndexToPositionConverter,
} from "./utils"

import { SceneItem, Image, IScene } from "@/engine/scene"
import { Painter } from "@/graphics"
import { ISize, IVector2D, Rect } from "@/maths"
import { createObserver, IObserver } from "@/utils"

import { chain, isNil, remove, times } from "lodash"

export class LandDataError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandDataError.prototype)
    }
}

export class Land<TerrainData extends ITerrainData> extends SceneItem implements ILand<TerrainData> {
    private terrains_: Array<Terrain<TerrainData>> = []
    private terrainsObserver_: IObserver<ITerrain<TerrainData>>

    private indexToPosition_: IndexToPositionConverter
    private positionToIndex_: PositionToIndexConverter

    private chunkSize_ = { width: 16, height: 16 }
    private chunks_: Array<Chunk> = []

    private positionToChunkIndex_: PositionToIndexConverter

    private onTerrainChanged_(terrain: ITerrain<TerrainData>) {
        const neighbors = this.neighborhood(terrain.position)

        chain(neighbors as Array<ITerrain<TerrainData>>)
            .tap(terrains => remove(terrains, isNil))
            .tap(terrains => terrains.push(terrain))
            .forEach(terrain => {
                const position = terrain.position
                const neighbors = this.neighborhood(position)
                const tiles: Array<Image> = []

                const terrainTile = this.tiles_[this.terrainImage_(terrain, neighbors)]
                if (!isNil(terrainTile)) {
                    tiles.push(terrainTile)
                }

                const fogTile = this.tiles_[this.fogImage_(terrain, neighbors)]
                if (!isNil(fogTile)) {
                    tiles.push(fogTile)
                }

                if (tiles.length > 0) {
                    const chunk = this.chunks_[this.positionToChunkIndex_(position)]
                    chunk.refresh({
                        x: position.x - chunk.x,
                        y: position.y - chunk.y,
                    }, tiles)
                }
            })
            .value()
    }

    protected tiles_: Array<Image> = []

    /* eslint-disable @typescript-eslint/no-unused-vars */
    protected terrainImage_(
        terrain: ITerrain<TerrainData>,
        neighbors: Neighborhood<TerrainData>
    ): number { return -1 }

    protected fogImage_(
        terrain: ITerrain<TerrainData>,
        neighbors: Neighborhood<TerrainData>
    ): number { return -1 }
    /* eslint-enable @typescript-eslint/no-unused-vars */

    constructor(
        scene: IScene,
        landData: LandInitialData<TerrainData>,
    ) {
        super(scene)

        this.indexToPosition_ = createIndexToPositionConverter(this.size)
        this.positionToIndex_ = createPositionToIndexConverter(this.size)

        this.terrainsObserver_ = createObserver<ITerrain<TerrainData>>()
        this.terrainsObserver_.subscribe(terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.terrains_ = times(this.width*this.height, index => {
            const position = this.indexToPosition_(index)
            const data = (typeof landData === "function")
                ? landData(position)
                : landData[index]

            if (isNil(data)) {
                throw new LandDataError("Not enougth data to cover land area!")
            }
            return new Terrain(position, data, this.terrainsObserver_.publish)
        })

        this.positionToChunkIndex_ = createPositionToIndexConverter(this.size, this.chunkSize_)

        for (const chunkRect of this.rect.partition(this.chunkSize_)) {
            this.chunks_.push(new Chunk(this.scene, chunkRect))
        }
    }

    render(painter: Painter, viewport: Rect): ILand<TerrainData> {
        for (const item of this.chunks_) {
            if (viewport.intersects(item.rect)) {
                item.render(painter, viewport)
            }
        }
        return this
    }

    update(): ILand<TerrainData> {
        for (const chunk of this.chunks_) {
            chunk.update()
        }
        return this
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
            const rect = this.rect.intersected(zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as ITerrain<TerrainData>
                }
            }
        } else {
            yield * this.terrains_
        }
    }

    onTerrainChanged(callback: (t: ITerrain<TerrainData>) => void)
        : () => void {
        return this.terrainsObserver_.subscribe(callback)
    }
}
