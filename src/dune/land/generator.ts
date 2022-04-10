import {
    type Config,
    type ITerrainData,
    TerrainType,
} from "./types"

import * as Engine from "@/engine"

import { createIndexToPositionConverter } from "@/engine/land/utils"
import { createNoise2DGenerator, createRangeMapper, IVector2D } from "@/maths"

import { chain, clamp, flow, isNil, omit, times } from "lodash"

function createTerrainTypeGenerator(config: Required<Config>)
    : (t: Partial<ITerrainData> & IVector2D) => Partial<ITerrainData> {
    const terrainNoise = flow(
        createNoise2DGenerator({
            seed: config.seed,
            scale: config.terrainScale,
            octaves: config.terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
    )
    return terrain => {
        const v = terrainNoise(terrain)

        if (v < config.terrainSandThreshold) {
            terrain.type = TerrainType.Dunes
        } else if (v < config.terrainRockThreshold) {
            terrain.type = TerrainType.Sand
        } else if (v < config.terrainMountainsThreshold) {
            terrain.type = TerrainType.Rock
        } else {
            terrain.type = TerrainType.Mountain
        }

        return terrain
    }
}

function createSpiceFieldGenerator(config: Required<Config>)
    : (t: Partial<ITerrainData> & IVector2D) => Partial<ITerrainData> {
    const spiceNoise = flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1)
    )

    return terrain => {
        const { type } = terrain

        if (isNil(type)) {
            throw new Error("type not initialized!")
        }

        if (type === TerrainType.Sand || type === TerrainType.Dunes) {
            const n = spiceNoise(terrain)

            if (n >= config.spiceThreshold && n < config.spiceSaturationThreshold) {
                terrain.type = TerrainType.SpiceField
                terrain.spice = 0.5
            } else if (n >= config.spiceSaturationThreshold) {
                terrain.type = TerrainType.SaturatedSpiceField
                terrain.spice = 1.0
            }
        }

        return terrain
    }
}

function createLandDataGenerator(landConfig: Required<Config>)
    : (p: IVector2D) => ITerrainData {
    const generateTerrainType = createTerrainTypeGenerator(landConfig)
    const generateSpiceField = createSpiceFieldGenerator(landConfig)

    return position => {
        return omit(
            chain(position as Partial<ITerrainData> & IVector2D)
                .tap(generateTerrainType)
                .tap(generateSpiceField)
                .value(),
            ["x", "y"]
        ) as ITerrainData
    }
}

export function ensureConfig(config: Config)
    : Required<Config> {
    const spiceThreshold = clamp(config.spiceThreshold ?? 0.6, 0, 1)
    const spiceSaturationThreshold = clamp(config.spiceSaturationThreshold ?? (1 + spiceThreshold)/2, spiceThreshold, 1)
    return {
        // Land size
        size: config.size,
        // Generator seed
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

@Engine.Decorators.LandGenerator()
export class Generator {
    generate(config: Config): Array<ITerrainData> {
        const { size } = config
        const generateTerrain = createLandDataGenerator(ensureConfig(config))
        const indexToPosition = createIndexToPositionConverter(size)

        return times(size.width*size.height, flow(
            indexToPosition,
            generateTerrain,
        ))
    }
}
