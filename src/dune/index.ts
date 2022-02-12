import { Game } from "@/engine/decorators"

import {
    PaletteIdentifier,
    TerrainImagesIdentifier,
    UnitsImagesIdentifier,
    MiscImagesIdentifier,
    PaletteDecoder,
    ImagesDecoder,
} from "./resources"

export * from "./resources"

@Game({
    resources: [{
        id: PaletteIdentifier,
        name: "palette",
        uri: "/assets/palette.json.gz",
        decoder: PaletteDecoder,
    }, {
        id: MiscImagesIdentifier,
        name: "misc images",
        uri: "/assets/images.misc.json.gz",
        decoder: ImagesDecoder,
    }, {
        id: TerrainImagesIdentifier,
        name: "terrain images",
        uri: "/assets/images.terrain.json.gz",
        decoder: ImagesDecoder,
    }, {
        id: UnitsImagesIdentifier,
        name: "units images",
        uri: "/assets/images.units.json.gz",
        decoder: ImagesDecoder,
    }],
})
export class Dune {}
