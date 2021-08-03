import { Image } from "@/engine"
import { Color } from "@/graphics"
import { Shape, Size } from "@/maths"

// Palette
export type Palette = readonly Color.RGBA[]

// Image set
export const ImageSets = ["misc", "terrain", "units"] as const
export type ImageSet = typeof ImageSets[number]
export type ImageLib = Record<ImageSet, readonly Image[]>

// Tile descriptor
export type TileDescriptor = {
    shape: Shape,
    images: Image[],
}

export type MapConfig = {
    size: Size,
    // Noise seed
    seed?: number,
    // Terrain values
    terrainScale?: number,               // clamped to [16, 64]
    terrainDetails?: number,             // clamped to [ 1, 6 ]
    terrainSandThreshold?: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold?: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold?: number,  // clamped to [ 0, 1 ]
    // Spice field values
    spiceScale?: number,                 // clamped to [16, 64]
    spiceDetails?: number,               // clamped to [ 1, 6 ]
    spiceThreshold?: number,             // clamped to [ 0, 1 ]
    spiceSaturationThreshold?: number    // clamped to [ spiceThreshold, 1 ]
}

export enum TerrainType {
    Dunes = 0,
    Sand,
    SpiceField,
    SaturatedSpiceField,
    Rock,
    Mountain,
}
