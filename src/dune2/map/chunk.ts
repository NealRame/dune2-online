import { neighborhood, positionToIndexConverter } from "./utils"
import { createChunkImage } from "./workers"

import { imageSet } from "@/dune2/data"
import { MapConfig, Terrain, TerrainType } from "@/dune2/types"

import { Image, Scene, SceneItem, Tile } from "@/engine"

import { RectangularCoordinates, Shape, Size } from "@/maths"

export type ChunkCallback = (p: RectangularCoordinates, s: Shape) => Promise<SceneItem>

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

export function ChunkCreator(scene: Scene, map: Terrain[], config: Required<MapConfig>)
    : ChunkCallback {
    const selectImage = terrainImageSelector(config.size)

    return async (position, shape) => {
        const positionToIndex = positionToIndexConverter(config.size, position)
        const images = []

        for (let y = 0; y < shape.rows; ++y) {
            for (let x = 0; x < shape.columns; ++x) {
                images.push(selectImage(map, positionToIndex({ x, y })))
            }
        }

        if (config.chunk) {
            const image = await createChunkImage({
                shape,
                images: images,
            })
            return new Tile(scene, position, { columns: 1, rows: 1 }, [image]) as SceneItem
        }

        return new Tile(scene, position, shape, images) as SceneItem
    }
}

export function generateChunks(
    config: Required<MapConfig>,
    chunkCallback: ChunkCallback,
): Promise<SceneItem[]> {
    const { size: mapSize, chunkSize } = config
    const chunks: Promise<SceneItem>[] = []

    for (let y = 0; y < mapSize.height; y += chunkSize.height) {
        for (let x = 0; x < mapSize.width; x += chunkSize.width) {
            const columns = Math.min(chunkSize.width, mapSize.width - x)
            const rows = Math.min(chunkSize.height, mapSize.height - y)
            chunks.push(chunkCallback({ x, y }, { columns, rows }))
        }
    }
    return Promise.all(chunks)
}
