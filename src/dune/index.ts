import * as Engine from "@/engine"

import {
    Palette,
    PaletteDecoder,
    MiscImages,
    TerrainImages,
    UnitsImages,
    ImagesDecoder,
} from "./resources"

@Engine.Decorators.Game({
    resources: [{
        id: Palette,
        name: "palette",
        uri: "/assets/palette.json.gz",
        decoder: PaletteDecoder,
    }, {
        id: MiscImages,
        name: "misc images",
        uri: "/assets/images.misc.json.gz",
        decoder: ImagesDecoder,
    }, {
        id: TerrainImages,
        name: "terrain images",
        uri: "/assets/images.terrain.json.gz",
        decoder: ImagesDecoder,
    }, {
        id: UnitsImages,
        name: "units images",
        uri: "/assets/images.units.json.gz",
        decoder: ImagesDecoder,
    }],
})
export class Game {}

export const Resources = {
    Palette,
    MiscImages,
    TerrainImages,
    UnitsImages,
}
