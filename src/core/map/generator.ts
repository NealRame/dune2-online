import { indexToPositionConverter } from "./utils"

import { MapConfig, Terrain, TerrainType } from "@/core/types"
import { createNoise2DGenerator, createRangeMapper, RectangularCoordinates, Size } from "@/maths"

import { chain, flow, isNil, times } from "lodash"

function terrainTypeGenerator(config: MapConfig)
    : (t: Partial<Terrain>) => Partial<Terrain> {
    const terrainNoise = flow(
        createNoise2DGenerator({
            seed: config.seed,
            scale: config.terrainScale,
            octaves: config.terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
    )
    return terrain => {
        const { position } = terrain

        if (isNil(position)) {
            throw new Error("position not initialized!")
        }

        const v = terrainNoise(position)

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

function spiceFieldGenerator(config: MapConfig)
    : (t: Partial<Terrain>) => Partial<Terrain> {
    const spiceNoise = flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1)
    )

    return terrain => {
        const { position, type } = terrain

        if (isNil(position)) {
            throw new Error("position not initialized!")
        }

        if (isNil(type)) {
            throw new Error("type not initialized!")
        }

        if (type === TerrainType.Sand || type === TerrainType.Dunes) {
            const n = spiceNoise(position)

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

function terrainGenerator(size: Size, config: MapConfig)
    : (p: RectangularCoordinates) => Terrain {
    const generateTerrainType = terrainTypeGenerator(config)
    const generateSpiceField = spiceFieldGenerator(config)
    return position => {
        return chain({ position })
            .tap(generateTerrainType)
            .tap(generateSpiceField)
            .value() as Terrain
    }
}

export function generateMap(size: Size, config: MapConfig)
    : Promise<Terrain[]> {
    const indexToPosition = indexToPositionConverter(size)
    return Promise.resolve(
        times(size.width*size.height, indexToPosition)
            .map(terrainGenerator(size, config))
    )
}
