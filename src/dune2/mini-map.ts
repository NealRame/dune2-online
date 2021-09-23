import { palette } from "./data"
import { ITerrain, ITerrainData, TerrainType } from "./land/types"

import * as Engine from "@/engine"
import { Color } from "@/graphics"

export function terrainColor(terrain: ITerrain)
    : Color.RGBA {
    const { revealed, type } = terrain.data
    const pal = palette()
    if (revealed) {
        switch (type) {
        case TerrainType.Sand:
            return pal[13*8 + 4]

        case TerrainType.Dunes:
            return pal[14*8 + 0]

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

export class MiniMap extends Engine.MiniMap<ITerrainData> {
    terrainColor = terrainColor
}
