import * as Engine from "@/engine"

import * as Resources from "./resources"
import * as Land from "./land"

@Engine.Decorators.Game({
    resources: [{
        id: Resources.Palette,
        name: "palette",
        uri: "/assets/palette.json.gz",
        Decoder: Resources.PaletteDecoder,
    }, {
        id: Resources.MiscImages,
        name: "misc images",
        uri: "/assets/images.misc.json.gz",
        Decoder: Resources.ImagesDecoder,
    }, {
        id: Resources.TerrainImages,
        name: "terrain images",
        uri: "/assets/images.terrain.json.gz",
        Decoder: Resources.ImagesDecoder,
    }, {
        id: Resources.UnitsImages,
        name: "units images",
        uri: "/assets/images.units.json.gz",
        Decoder: Resources.ImagesDecoder,
    }],
    land: {
        id: Land.id,
        Generator: Land.Generator,
        ColorsProvider: Land.ColorsProvider,
        TilesProvider: Land.TilesProvider,
    }
})
export class Game {}

export * as Resources from "./resources"
export * as Land from "./land"
