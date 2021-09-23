import { ITerrain, ITerrainData, TerrainType } from "./types"

import { imageSet } from "@/dune2/data"
import * as Engine from "@/engine"

import { reduceRight } from "lodash"

function isRocky(type: TerrainType): boolean {
    return type === TerrainType.Rock
        || type === TerrainType.Mountain
}

function isSpicy(type: TerrainType): boolean {
    return type === TerrainType.SpiceField
        || type === TerrainType.SaturatedSpiceField
}

function terrainTopoMask(
    terrain: ITerrain,
    neighbors: Engine.Neighborhood<ITerrainData>,
): number {
    const terrainType = terrain.data.type
    return reduceRight(
        neighbors,
        (val, neighbor) => {
            const neighborType = (neighbor ?? terrain).data.type
            if (terrainType === TerrainType.Rock && isRocky(neighborType)) {
                return 2*val + 1
            }
            if (terrainType === TerrainType.SpiceField && isSpicy(neighborType)) {
                return 2*val + 1
            }
            if (terrainType === neighborType) {
                return 2*val + 1
            }
            return 2*val
        },
        0,
    )
}

function terrainRevealMask(
    terrain: ITerrain,
    neighbors: Engine.Neighborhood<ITerrainData>,
): number {
    if (terrain.data.revealed) return 0
    return reduceRight(
        neighbors,
        (val, neighbor) => 2*val + (neighbor?.data.revealed ? 1 : 0),
        0,
    )
}

export function terrainTileIndex(
    terrain: ITerrain,
    neighbors: Engine.Neighborhood<ITerrainData>,
): number {
    const topoImageOffset = terrainTopoMask(terrain, neighbors)

    switch (terrain.data.type) {
    case TerrainType.Rock:
        return 128 + topoImageOffset

    case TerrainType.Dunes:
        return 144 + topoImageOffset

    case TerrainType.Mountain:
        return 160 + topoImageOffset

    case TerrainType.SpiceField:
        return 176 + topoImageOffset

    case TerrainType.SaturatedSpiceField:
        return 192 + topoImageOffset

    default:
        return 127
    }
}

export function fogTileIndex(
    terrain: ITerrain,
    neighbors: Engine.Neighborhood<ITerrainData>
): number {
    const revealMaskImageOffset = terrainRevealMask(terrain, neighbors)
    return revealMaskImageOffset > 0 ? 123 - revealMaskImageOffset : -1
}

export class Land extends Engine.Land<ITerrainData> {
    tiles = imageSet("terrain")
    terrainImage = terrainTileIndex
    fogImage = fogTileIndex
}
