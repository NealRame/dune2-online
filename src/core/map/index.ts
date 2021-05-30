import { Chunk } from "./chunk"
import { neighborhood, partition, positionToIndexConverter } from "./utils"
import { generateMap } from "./generator"

import { imageSet } from "@/core/data"
import { Image, MapConfig, Neighborhood, ScaleFactor, SceneItem, Terrain, TerrainType } from "@/core/types"

import { Painter } from "@/graphics"
import { Rect, Size, Vector } from "@/maths"

import { clamp } from "lodash"

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

function terrainTileSelector(size: Size)
    : (t: Terrain, i: number, m: Terrain[]) => Image {
    const images = imageSet("terrain")
    const neighbors = neighborhood(size)

    return (terrain, index, map) => selectTile(terrain, neighbors(terrain, map), images)
}

function checkConfig(config: Partial<MapConfig>): MapConfig {
    const spiceThreshold = clamp(config.spiceThreshold ?? 0.6, 0, 1)
    const spiceSaturationThreshold = clamp(config.spiceSaturationThreshold ?? (1 + spiceThreshold)/2, spiceThreshold, 1)
    return {
        // Noise seed
        seed: config.seed ?? Date.now(),
        // Terrain values
        terrainScale: clamp(Math.floor(config.terrainScale ?? 32), 16, 64),
        terrainDetails: clamp(Math.floor(config.terrainDetails ?? 1), 1, 6),
        terrainSandThreshold: clamp(config.terrainSandThreshold ?? 2/5, 0, 1),
        terrainRockThreshold: clamp(config.terrainRockThreshold ?? 5/8, 0, 1),
        terrainMountainsThreshold: clamp(config.terrainMountainsThreshold ?? 7/8, 0, 1),
        // Spice field values
        spiceScale: clamp(Math.floor(config.spiceScale ?? 16), 16, 64),
        spiceDetails: clamp(Math.floor(config.spiceDetails ?? 1), 1, 6),
        spiceThreshold,
        spiceSaturationThreshold,
    }
}

export function createMap(size: Size, config: Partial<MapConfig>): SceneItem {
    const map = generateMap(size, checkConfig(config))
    const images = map.map(terrainTileSelector(size))
    const chunks = partition(size, { width: 32, height: 32 }).map(chunkRect => {
        return new Chunk(chunkRect, images, positionToIndexConverter(size))
    })

    return {
        get position() {
            return Vector.Null()
        },
        get size(): Size {
            return size
        },
        get rect(): Rect {
            return new Rect(this.position, this.size)
        },
        update(): SceneItem {
            return this
        },
        render(
            painter: Painter,
            gridSpacing: number,
            scale: ScaleFactor,
            viewport: Rect
        ): SceneItem {
            for (const chunk of chunks) {
                if (viewport.intersects(chunk.rect)) {
                    chunk.render(painter, gridSpacing, scale, viewport)
                }
            }
            return this
        }
    }
}
