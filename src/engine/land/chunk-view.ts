import { Chunk } from "./chunk"
import {
    ITerrainData,
    ITerrain,
    ILand,
    ILandTerrainTilesProvider,
    ILandView,
} from "./types"
import {
    createPositionToIndexConverter,
    PositionToIndexConverter,
} from "./utils"

import { Image, IScene, SceneItem } from "@/engine/scene"
import { Painter } from "@/graphics"
import { ISize2D, Rect } from "@/maths"

import { chain, isNil, remove } from "lodash"

export class LandChunkView<
    TerrainData extends ITerrainData
> extends SceneItem implements ILandView {
    private chunkSize_: ISize2D = { width: 16, height: 16 }
    private chunks_: Array<Chunk> = []

    private positionToChunkIndex_: PositionToIndexConverter
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

        this.positionToChunkIndex_ = createPositionToIndexConverter(
            this.size,
            this.chunkSize_,
        )

        for (const chunkRect of this.rect.partition(this.chunkSize_)) {
            this.chunks_.push(new Chunk(this.scene, chunkRect))
        }
    }

    get width(): number {
        return this.scene.width
    }

    get height(): number {
        return this.scene.height
    }

    render(painter: Painter, viewport: Rect)
        : ILandView {
        for (const item of this.chunks_) {
            if (viewport.overlap(item.rect)) {
                item.render(painter, viewport)
            }
        }
        return this
    }

    update()
        : ILandView {
        for (const chunk of this.chunks_) {
            chunk.update()
        }
        return this
    }
}
