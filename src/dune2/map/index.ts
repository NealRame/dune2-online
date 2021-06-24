import { ChunkCreator, generateChunks } from "./chunk"
import { generateMap } from "./generator"

import { MapConfig } from "@/dune2/types"
import { Scene, SceneItem } from "@/engine"

import { Painter } from "@/graphics"
import { Rect, Size, Vector } from "@/maths"

import { clamp } from "lodash"

function checkConfig(config: MapConfig): Required<MapConfig> {
    const spiceThreshold = clamp(config.spiceThreshold ?? 0.6, 0, 1)
    const spiceSaturationThreshold = clamp(config.spiceSaturationThreshold ?? (1 + spiceThreshold)/2, spiceThreshold, 1)
    return {
        size: config.size,
        // Chunk
        chunkSize: config.chunkSize ?? { width: 32, height: 64 },
        chunk: config.chunk ?? false,
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

export async function createMap(scene: Scene, config: MapConfig)
    : Promise<SceneItem> {
    const checkedConfig = checkConfig(config)

    const map = generateMap(checkedConfig)
    const createChunk = ChunkCreator(scene, map, checkedConfig)
    const chunks = await generateChunks(checkedConfig, createChunk)

    return {
        get scene(): Scene {
            return scene
        },
        get position() {
            return Vector.Null()
        },
        get width(): number {
            return config.size.width
        },
        get height(): number {
            return config.size.height
        },
        get size(): Size {
            return {
                width: config.size.width,
                height: config.size.height,
            }
        },
        get rect(): Rect {
            return new Rect({ x: 0, y: 0 }, config.size)
        },
        update(): SceneItem {
            return this as SceneItem
        },
        render(
            painter: Painter,
            viewport: Rect
        ): SceneItem {
            for (const chunk of chunks) {
                if (viewport.intersects(chunk.rect)) {
                    chunk.render(painter, viewport)
                }
            }
            return this as SceneItem
        }
    }
}
