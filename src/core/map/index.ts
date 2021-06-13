import { generateChunks } from "./chunk"
import { generateMap } from "./generator"

import { MapConfig, ScaleFactor, SceneItem } from "@/core/types"

import { Painter } from "@/graphics"
import { Rect, Size, Vector } from "@/maths"

import { clamp } from "lodash"

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
        // Chunk
        chunkSize: clamp(Math.floor(config.chunkSize ?? 32), 1, 64),
        chunk: config.chunk ?? false,
    }
}

export async function createMap(size: Size, config: Partial<MapConfig>)
    : Promise<SceneItem> {
    const map = await generateMap(size, checkConfig(config))
    const chunks = await generateChunks(map, size, checkConfig(config))

    return {
        get position() {
            return Vector.Null()
        },
        get size(): Size {
            return size
        },
        get rect(): Rect {
            return new Rect({ x: 0, y: 0 }, size)
        },
        update(): SceneItem {
            return this as SceneItem
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
            return this as SceneItem
        }
    }
}
