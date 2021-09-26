import { Chunk } from "./chunk"
import { Land } from "./land"
import {
    ITerrainData,
    ITerrain,
} from "./types"
import {
    createPositionToIndexConverter,
    PositionToIndexConverter,
} from "./utils"

import { Image, IScene, SceneItem } from "@/engine/scene"
import { Painter } from "@/graphics"
import { Rect } from "@/maths"

import { chain, isNil, remove } from "lodash"

export class LandView<
    TerrainData extends ITerrainData
> extends SceneItem {
    private land_: Land<TerrainData>
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

                const terrainTileIndex = this.land_.terrainImage(terrain, neighbors)
                if (terrainTileIndex >= 0) {
                    tiles.push(this.land_.tiles[terrainTileIndex])
                }

                const fogTileIndex = this.land_.fogImage(terrain, neighbors)
                if (fogTileIndex >= 0) {
                    tiles.push(this.land_.tiles[fogTileIndex])
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
        land: Land<TerrainData>,
        scene: IScene,
    ) {
        super(scene)

        this.land_ = land
        this.land_.listen("terrainChanged", terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.positionToChunkIndex_ = createPositionToIndexConverter(
            this.size,
            land.chunkSize,
        )

        for (const chunkRect of this.rect.partition(land.chunkSize)) {
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
        : SceneItem {
        for (const item of this.chunks_) {
            if (viewport.intersects(item.rect)) {
                item.render(painter, viewport)
            }
        }
        return this
    }

    update()
        : SceneItem {
        for (const chunk of this.chunks_) {
            chunk.update()
        }
        return this
    }
}
