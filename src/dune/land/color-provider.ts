import {
    ITerrainData,
    TerrainType,
} from "@/dune/land/types"

import {
    Palette,
} from "@/dune/resources"

import * as Engine from "@/engine"
import { Inject } from "@/engine/injector"

import { RGBA } from "@/graphics/color"

export class ColorsProvider implements Engine.ILandTerrainColorProvider<ITerrainData> {
    constructor(
        @Inject(Palette) private palette_: Engine.Palette,
    ) { }

    getTerrainColor(terrain: Engine.ITerrain<ITerrainData>): RGBA {
        const { revealed, type } = terrain.data
        if (revealed) {
            switch (type) {
            case TerrainType.Sand:
                return this.palette_[13*8 + 4]

            case TerrainType.Dunes:
                return this.palette_[14*8 + 0]

            case TerrainType.SpiceField:
                return this.palette_[14*8 + 6]

            case TerrainType.SaturatedSpiceField:
                return this.palette_[14*8 + 7]

            case TerrainType.Rock:
                return this.palette_[3*8 + 4]

            case TerrainType.Mountain:
                return this.palette_[31*8 + 0]
            }
        }
        return [0, 0, 0, 0]
    }
}
