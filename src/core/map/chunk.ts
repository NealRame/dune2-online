import { partition, neighborhood, positionToIndexConverter } from "./utils"
import { createChunkImage } from "./workers"

import { imageSet } from "@/core/data"
import { AbstractSceneItem } from "@/core/scene-item"
import { createTile, TileConfig } from "@/core/tile"
import { Image, MapConfig, Neighborhood, ScaleFactor, SceneItem, Terrain, TerrainType } from "@/core/types"

import { Painter } from "@/graphics"
import { Rect, Size } from "@/maths"

export class Chunk extends AbstractSceneItem {
    private image_: Image

    constructor(chunkRect: Rect, image: Image) {
        super(chunkRect)
        this.image_ = image
    }

    set image(image: Image) {
        this.image_ = image
    }

    render(
        painter: Painter,
        gridSpacing: number,
        scale: ScaleFactor,
        viewport: Rect
    ): Chunk {
        painter.drawImageBitmap(
            this.image_[scale],
            this.position.sub(viewport.topLeft()).mul(gridSpacing),
        )
        return this
    }
}

async function createChunk(config: TileConfig): Promise<SceneItem> {
    const image = await createChunkImage({
        chunkSize: config.size,
        images: config.images,
    })
    return new Chunk(
        new Rect(config.position ?? { x: 0, y: 0 }, config.size),
        image
    )
}

async function createTiledChunk(config:TileConfig): Promise<SceneItem> {
    return Promise.resolve(createTile(config))
}

function terrainImageSelector(size: Size)
    : (m: Terrain[], index: number) => Image {
    const images = imageSet("terrain")
    const neighbors = neighborhood(size)
    return (map, index) => {
        const terrain = map[index]
        const typeMask =
            neighbors(terrain, map)
                .map((neighbor): number => {
                    const type = (neighbor ?? terrain).type
                    if (terrain.type === TerrainType.Rock) {
                        return (type === TerrainType.Rock || type === TerrainType.Mountain) ? 1 : 0
                    }
                    if (terrain.type === TerrainType.SpiceField) {
                        return (type === TerrainType.SpiceField || type === TerrainType.SaturatedSpiceField) ? 1 : 0
                    }
                    return type === terrain.type ? 1 : 0
                })
                .reduce((prev, cur, index) => prev + (cur << index), 0)

        switch (terrain.type) {
        case TerrainType.Rock:
            return images[128 + typeMask]
        case TerrainType.Dunes:
            return images[144 + typeMask]
        case TerrainType.Mountain:
            return images[160 + typeMask]
        case TerrainType.SpiceField:
            return images[176 + typeMask]
        case TerrainType.SaturatedSpiceField:
            return images[192 + typeMask]
        }

        return images[127]
    }
}

export function ChunkCreator(map: Terrain[], mapSize: Size, config: MapConfig)
    : (r: Rect) => Promise<SceneItem> {
    const selectImage = terrainImageSelector(mapSize)
    const factory = config.chunk ? createChunk : createTiledChunk

    return (chunkRect) => {
        const position = chunkRect.topLeft()
        const size = chunkRect.size
        const positionToIndex = positionToIndexConverter(mapSize, position)
        const images = []

        for (let y = 0; y < size.height; ++y) {
            for (let x = 0; x < size.width; ++x) {
                images.push(selectImage(map, positionToIndex({ x, y })))
            }
        }

        return factory({ position, size, images })
    }
}

export function generateChunks(map: Terrain[], mapSize: Size, config: MapConfig)
    : Promise<SceneItem[]> {
    const chunkSize = {
        width: config.chunkSize,
        height: config.chunkSize
    }

    return Promise.all(partition(mapSize, chunkSize).map(ChunkCreator(map, mapSize, config)))
}
