import { ITerrain, ITerrainData, TerrainType } from "./types"

import { TerrainImages } from "@/dune/resources"

import * as Engine from "@/engine"
import { Inject } from "@/engine/injector"

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
    neighbors: Engine.Land.Neighborhood<ITerrainData>,
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
    neighbors: Engine.Land.Neighborhood<ITerrainData>,
): number {
    if (terrain.data.revealed) return 0
    return reduceRight(
        neighbors,
        (val, neighbor) => 2*val + (neighbor?.data.revealed ? 1 : 0),
        0,
    )
}

function terrainTileIndex(
    terrain: ITerrain,
    neighbors: Engine.Land.Neighborhood<ITerrainData>,
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

function fogTileIndex(
    terrain: ITerrain,
    neighbors: Engine.Land.Neighborhood<ITerrainData>
): number {
    const revealMaskImageOffset = terrainRevealMask(terrain, neighbors)
    return revealMaskImageOffset > 0 ? 123 - revealMaskImageOffset : -1
}

export class TilesProvider implements Engine.Land.ILandTerrainTilesProvider<ITerrainData> {
    constructor(
        @Inject(TerrainImages) private tiles_: Array<Engine.Image>,
    ) { }

    getFogTile(
        terrain: ITerrain,
        neighbors: Engine.Land.Neighborhood<ITerrainData>,
    ): Engine.Image | null {
        const index = fogTileIndex(terrain, neighbors)
        return index < 0 ? null : this.tiles_[index]
    }

    getTerrainTile(
        terrain: ITerrain,
        neighbors: Engine.Land.Neighborhood<ITerrainData>,
    ): Engine.Image {
        return this.tiles_[terrainTileIndex(terrain, neighbors)]
    }
}
