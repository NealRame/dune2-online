import { Chunk } from "./chunk"

import {
    ITerrainData,
    ITerrain,
    ILand,
    ILandTerrainTilesProvider,
} from "@/engine/land/types"

import {
    createPositionToIndexConverter,
    PositionToIndexConverter,
} from "@/engine/land/utils"

import { Image, IScene, SceneItem } from "@/engine/scene"
import { Painter } from "@/graphics"
import { ISize2D, Rect } from "@/maths"

import { chain, constant, isNil, remove } from "lodash"

export class LandChunkView<
    TerrainData extends ITerrainData
> extends SceneItem {
    private chunkSize_: ISize2D = { width: 16, height: 16 }
    private chunks_: Array<Chunk> = []

    private positionToChunkIndex_: PositionToIndexConverter = constant(0)

    private onTerrainChanged_(terrain: ITerrain<TerrainData>) {
        const neighbors = this.land_.neighborhood(terrain.position)

        chain(neighbors as Array<ITerrain<TerrainData>>)
            .tap(terrains => remove(terrains, isNil))
            .tap(terrains => terrains.push(terrain))
            .forEach(terrain => {
                const position = terrain.position
                const neighbors = this.land_.neighborhood(position)
                const tiles: Array<Image> = []

                const terrainTile = this.tilesProvider_.getTerrainTile(terrain, neighbors)
                if (!isNil(terrainTile)) {
                    tiles.push(terrainTile)
                }

                const fogTile = this.tilesProvider_.getFogTile(terrain, neighbors)
                if (!isNil(fogTile)) {
                    tiles.push(fogTile)
                }

                if (tiles.length > 0) {
                    const chunkIndex = this.positionToChunkIndex_(position)
                    const chunk = this.chunks_[chunkIndex]
                    chunk.refresh({
                        x: position.x - chunk.x,
                        y: position.y - chunk.y,
                    }, tiles)
                }
            })
            .value()
    }

    constructor(
        private land_: ILand<TerrainData>,
        private tilesProvider_: ILandTerrainTilesProvider<TerrainData>,
        scene: IScene,
    ) {
        super(scene)

        this.land_.events.on("terrainChanged", terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.land_.events.on("reset", () => {
            this.chunks_ = []
            this.positionToChunkIndex_ = createPositionToIndexConverter(
                this.size,
                this.chunkSize_,
            )

            for (const chunkRect of this.rect.partition(this.chunkSize_)) {
                this.chunks_.push(new Chunk(this.scene, chunkRect))
            }
        })
    }

    get width(): number {
        return this.land_.width
    }

    get height(): number {
        return this.land_.height
    }

    render(painter: Painter, viewport: Rect)
        : this {
        for (const chunk of this.chunks_) {
            chunk.update()
            if (viewport.overlap(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }
}
