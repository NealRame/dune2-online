import * as Engine from "@/engine"

// import {
//     Palette,
//     PaletteDecoder,
//     MiscImages,
//     TerrainImages,
//     UnitsImages,
//     ImagesDecoder,
// } from "./resources"

import * as Resources from "./resources"
import * as Land from "./land"

@Engine.Decorators.Game({
    resources: [{
        decoder: Resources.PaletteDecoder,
        id: Resources.Palette,
        name: "palette",
        uri: "/assets/palette.json.gz",
    }, {
        decoder: Resources.ImagesDecoder,
        id: Resources.MiscImages,
        name: "misc images",
        uri: "/assets/images.misc.json.gz",
    }, {
        decoder: Resources.ImagesDecoder,
        id: Resources.TerrainImages,
        name: "terrain images",
        uri: "/assets/images.terrain.json.gz",
    }, {
        decoder: Resources.ImagesDecoder,
        id: Resources.UnitsImages,
        name: "units images",
        uri: "/assets/images.units.json.gz",
    }],
    land: {
        id: Land.id,
        generator: Land.Generator,
        tilesProvider: Land.TileProvider,
    }
})
export class Game {}

export * as Resources from "./resources"

// export const Resources = {
//     Palette,
//     MiscImages,
//     TerrainImages,
//     UnitsImages,
// }
