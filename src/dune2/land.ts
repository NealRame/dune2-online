import { LandConfig, TerrainType } from "@/dune2/types"
import { imageSet, palette } from "@/dune2/data"

import { RGBA } from "@/graphics/color"

import { Image } from "@/engine"
import { AbstractTerrain, ILand, Neighborhood, TerrainGenerator } from "@/engine/land"

import { createNoise2DGenerator, createRangeMapper, IRectangularCoordinates } from "@/maths"

import { chain, clamp, flow, isNil } from "lodash"

export class Terrain extends AbstractTerrain {
    spice = 0
    type = TerrainType.Dunes

    constructor(land: ILand<Terrain>, position: IRectangularCoordinates) {
        super(land, position)
        this.position_ = position
    }

    get color(): RGBA {
        const pal = palette()
        if (this.revealed) {
            switch (this.type) {
            case TerrainType.Sand:
                return pal[13*8 + 4]
                // return pal[28*8 + 0]

            case TerrainType.Dunes:
                return pal[14*8 + 0]
                // return pal[28*8 + 1]

            case TerrainType.SpiceField:
                return pal[14*8 + 6]

            case TerrainType.SaturatedSpiceField:
                return pal[14*8 + 7]

            case TerrainType.Rock:
                return pal[3*8 + 4]

            case TerrainType.Mountain:
                return pal[31*8 + 0]
            }
        }
        return [0, 0, 0, 0]
    }

    private topoMask_(): number {
        return (this.neighbors as Neighborhood<Terrain>)
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
    }

    private revealMask_(): number {
        if (this.revealed) return 0
        return (this.neighbors as Neighborhood<Terrain>)
            .map(neighbor => neighbor?.revealed ?? false)
            .reduce((prev, cur, index) => cur ? prev + (1 << index) : prev, 0)
    }

    image(): Image[] {
        const lib = imageSet("terrain")
        const topoImageOffset = this.topoMask_()
        const revealMaskImageOffset = this.revealMask_()

        const images: Image[] = []

        if (this.revealed || revealMaskImageOffset > 0) {
            switch (this.type) {
            case TerrainType.Rock:
                images.push(lib[128 + topoImageOffset])
                break

            case TerrainType.Dunes:
                images.push(lib[144 + topoImageOffset])
                break

            case TerrainType.Mountain:
                images.push(lib[160 + topoImageOffset])
                break

            case TerrainType.SpiceField:
                images.push(lib[176 + topoImageOffset])
                break

            case TerrainType.SaturatedSpiceField:
                images.push(lib[192 + topoImageOffset])
                break

            default:
                images.push(lib[127])
                break
            }
        }

        if (!this.revealed && revealMaskImageOffset > 0) {
            images.push(lib[123 - revealMaskImageOffset])
        }

        return images
    }
}

function terrainTypeGenerator(config: Required<LandConfig>)
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

function spiceFieldGenerator(config: Required<LandConfig>)
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

function checkConfig(config: LandConfig): Required<LandConfig> {
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

export function createTerrainGenerator(LandConfig?: LandConfig)
    : TerrainGenerator<Terrain> {
    const config = checkConfig(LandConfig ?? {})
    const generateTerrainType = terrainTypeGenerator(config)
    const generateSpiceField = spiceFieldGenerator(config)
    return (land, position) => {
        return chain(new Terrain(land, position))
            .tap(generateTerrainType)
            .tap(generateSpiceField)
            .value()
    }
}
