import { createNoise2DGenerator, createRangeMapper, RectangularCoordinates, Size } from "@/maths"

import { clamp, flow, times, tap } from "lodash"

export enum TerrainType {
    Dunes = 0,
    Sand,
    Rock,
    Mountain,
}

export type Terrain = {
    type: TerrainType,
    spice: number,
}

export type LandMapConfig = {
    seed: number,
    terrainScale: number,        // clamped to [16, 64]
    terrainThreshold: number,    // clamped to [ 0, 1 ]
    terrainDetails: number,      // clamped to [ 1, 6 ]
    mountainsThreshold: number,  // clamped to [ 0, 1 ]
    mountainsDetails: number,    // clamped to [ 1, 6 ]
    dunesThreshold: number,      // clamped to [ 0, 1 ]
    dunesDetails: number,        // clamped to [ 1, 6 ]
    spiceScale: number,          // clamped to [16, 64]
    spiceThreshold: number,      // clamped to [ 0, 1 ]
    spiceDetails: number,        // clamped to [ 1, 6 ]
}

function checkConfig(config: Partial<LandMapConfig>): LandMapConfig {
    return {
        seed: config.seed ?? Date.now(),
        terrainScale: clamp(Math.floor(config.terrainScale ?? 32), 16, 64),
        terrainDetails: clamp(Math.floor(config.terrainDetails ?? 1), 1, 6),
        terrainThreshold: clamp(config.terrainThreshold ?? 0.666, 0, 1),
        mountainsThreshold: clamp(config.mountainsThreshold ?? 0.1, 0, 1),
        mountainsDetails: clamp(Math.floor(config.mountainsDetails ?? 1), 1, 6),
        dunesThreshold: clamp(config.dunesThreshold ?? 0.666, 0, 1),
        dunesDetails: clamp(Math.floor(config.dunesDetails ?? 1), 1, 6),
        spiceScale: clamp(Math.floor(config.spiceScale ?? 32), 16, 64),
        spiceThreshold: clamp(config.spiceThreshold ?? 0.25, 0, 1),
        spiceDetails: clamp(Math.floor(config.spiceDetails ?? 1), 1, 6),
    }
}

export function createLandMap(
    { width, height }: Size,
    config: Partial<LandMapConfig>,
): Terrain[][] {
    const {
        seed,
        terrainScale,
        terrainThreshold,
        terrainDetails,
        mountainsThreshold,
        mountainsDetails,
        dunesThreshold,
        dunesDetails,
        spiceScale,
        spiceThreshold,
        spiceDetails,
    } = checkConfig(config)
    const terrain = flow(
        createNoise2DGenerator({
            seed,
            scale: terrainScale,
            octaves: terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
        (n: number): Terrain => ({
            spice: 0,
            type: n < terrainThreshold
                ? TerrainType.Sand
                : TerrainType.Rock
        })
    )
    const dunes = flow(
        createNoise2DGenerator({
            seed,
            scale: terrainScale,
            octaves: dunesDetails,
        }),
        (n: number): number => n/2,
        Math.tanh,
        Math.abs,
        (n: number): TerrainType => {
            return 1 - n < dunesThreshold
                ? TerrainType.Dunes
                : TerrainType.Sand
        }
    )
    const mountains = flow(
        createNoise2DGenerator({
            seed,
            scale: terrainScale,
            octaves: mountainsDetails,
        }),
        (n: number): number => 2*n,
        Math.tanh,
        Math.abs,
        (n: number): TerrainType => {
            return n < mountainsThreshold
                ? TerrainType.Mountain
                : TerrainType.Rock
        }
    )
    const spice = flow(
        createNoise2DGenerator({
            seed: seed + 1,
            scale: spiceScale,
            octaves: spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
        (n: number): number => {
            return n < spiceThreshold
                ? 1
                : 0
        }
    )

    const map = times(height, y => times(width, x => {
        return tap(
            terrain({ x, y }),
            t => {
                if (t.type === TerrainType.Sand) {
                    t.type = dunes({ x, y })
                    t.spice = spice({ x, y })
                } else {
                    t.type = mountains({ x, y })
                }
            }
        )
    }))

    return map
}
