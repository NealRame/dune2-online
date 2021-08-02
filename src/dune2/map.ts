// import { indexToPositionConverter } from "./utils"

import { MapConfig, TerrainType } from "@/dune2/types"
import { imageSet } from "@/dune2/data"

import { RGBA } from "@/graphics/color"

import { Image, Neighborhood, Terrain } from "@/engine"
import { indexToPositionConverter } from "@/engine/land/utils"

import { createNoise2DGenerator, createRangeMapper, RectangularCoordinates } from "@/maths"

import { chain, clamp, flow, isNil, times } from "lodash"

class Dune2Terrain implements Terrain {
    private position_: RectangularCoordinates

    revealed = false
    spice = 0
    type = TerrainType.Dunes

    constructor(position: RectangularCoordinates) {
        this.position_ = position
    }

    get position(): RectangularCoordinates {
        return {
            x: this.position_.x,
            y: this.position_.y,
        }
    }

    get color(): RGBA {
        return [0, 0, 0, 0]
    }

    image(neighbors: Neighborhood<Terrain>): Image {
        const images = imageSet("terrain")
        const typeMask = (neighbors as Neighborhood<Dune2Terrain>)
            .map(neighbor => {
                const type = (neighbor ?? this).type
                if (this.type === TerrainType.Rock) {
                    return type === TerrainType.Rock || type === TerrainType.Mountain
                }
                if (this.type === TerrainType.SpiceField) {
                    return type === TerrainType.SpiceField || type === TerrainType.SaturatedSpiceField
                }
                return type === this.type
            })
            .reduce((prev, cur, index) => cur ? prev + (1 << index) : prev, 0)

        switch (this.type) {
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

function terrainTypeGenerator(config: Required<MapConfig>)
    : (t: Partial<Dune2Terrain>) => Partial<Dune2Terrain> {
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

function spiceFieldGenerator(config: Required<MapConfig>)
    : (t: Partial<Dune2Terrain>) => Partial<Dune2Terrain> {
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

function terrainGenerator(config: Required<MapConfig>)
    : (index: number) => Terrain {
    const indexToPosition = indexToPositionConverter(config.size)
    const generateTerrainType = terrainTypeGenerator(config)
    const generateSpiceField = spiceFieldGenerator(config)
    return index => {
        return chain(new Dune2Terrain(indexToPosition(index)))
            .tap(generateTerrainType)
            .tap(generateSpiceField)
            .value() as Terrain
    }
}

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

export function createMap(config: MapConfig)
    : Terrain[] {
    return times(
        config.size.width*config.size.height,
        terrainGenerator(checkConfig(config))
    )
}
