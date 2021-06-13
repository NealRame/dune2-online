import { partition, neighborhood, positionToIndexConverter } from "./utils"
import { createChunkImage } from "./workers"

import { imageSet } from "@/core/data"
import { AbstractSceneItem } from "@/core/scene-item"
import { createTile } from "@/core/tile"
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

function ChunkImagesGetter(mapSize: Size, images: Image[]) {
    const positionToIndex = positionToIndexConverter(mapSize)

    return (chunkRect: Rect) => {
        const xMin = chunkRect.x
        const xMax = xMin + chunkRect.width
        const yMin = chunkRect.y
        const yMax = yMin + chunkRect.height
        const chunkImages = []
        for (let y = yMin; y < yMax; ++y) {
            for (let x = xMin; x < xMax; ++x) {
                const index = positionToIndex({ x, y })
                chunkImages.push(images[index])
            }
        }
        return chunkImages
    }
}

type ChunkConfig = {
    chunkRect: Rect,
    images: Image[]
}

async function createChunk({ chunkRect, images }: ChunkConfig)
    : Promise<Chunk> {
    const image = await createChunkImage({
        chunkSize: chunkRect.size,
        images
    })
    return new Chunk(chunkRect, image)
}

function createChunks(images: Image[], mapSize: Size, config: MapConfig) {
    const getChunkImages = ChunkImagesGetter(mapSize, images)
    const chunkSize = {
        width: config.chunkSize,
        height: config.chunkSize
    }
    return Promise.all(partition(mapSize, chunkSize).map(chunkRect => {
        const chunkImages = getChunkImages(chunkRect)
        return Promise.resolve(config.chunk
            ? createChunk({
                chunkRect,
                images: chunkImages,
            })  as Promise<SceneItem>
            : createTile({
                position: chunkRect.topLeft(),
                size: chunkRect.size,
                images: chunkImages,
            }) as SceneItem
        )
    }))
}

function selectTile(
    terrain: Terrain,
    neighbors: Neighborhood<Terrain>,
    images: readonly Image[],
): Image {
    const typeMask = neighbors
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

function terrainImageSelector(size: Size)
    : (t: Terrain, i: number, m: Terrain[]) => Image {
    const images = imageSet("terrain")
    const neighbors = neighborhood(size)
    return (terrain, index, map) => selectTile(
        terrain,
        neighbors(terrain, map),
        images
    )
}

export function generateChunks(land: Terrain[], mapSize: Size, config: MapConfig)
    : Promise<SceneItem[]> {
    const images = land.map(terrainImageSelector(mapSize))
    return createChunks(images, mapSize, config)
}
