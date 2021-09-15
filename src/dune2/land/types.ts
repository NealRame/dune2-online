import * as Engine from "@/engine"

export enum TerrainType {
    Dunes = 0,
    Sand,
    SpiceField,
    SaturatedSpiceField,
    Rock,
    Mountain,
}

export interface ITerrainData extends Engine.ITerrainData {
    spice: number
    type: TerrainType
}

export type ITerrain = Engine.ITerrain<ITerrainData>

export interface ILandConfig {
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
