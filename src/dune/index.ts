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
        name: "misc",
        uri: "/assets/images.misc.json.gz",
        Decoder: Resources.ImagesDecoder,
    }, {
        id: Resources.TerrainImages,
        name: "terrain",
        uri: "/assets/images.terrain.json.gz",
        Decoder: Resources.ImagesDecoder,
    }, {
        id: Resources.UnitsImages,
        name: "units",
        uri: "/assets/images.units.json.gz",
        Decoder: Resources.ImagesDecoder,
    }],
    land: {
        id: Land.id,
        Generator: Land.Generator,
        ColorsProvider: Land.ColorsProvider,
        TilesProvider: Land.TilesProvider,
    },
})
export class Game implements Engine.IGameController {
    onStart(engine: Engine.IGameEngine): void {
        const viewport = engine.get(Engine.GameScene).viewport
        const size = {
            width: 32,
            height: 32,
        }

        engine
            .get(Land.id)
            .generate(Land.ensureConfig({ size }))
            .reveal({ x: size.width/2 - 2, y: size.height/2 - 1 }, {
                width: 5,
                height: 3,
            })
            .reveal({ x: size.width/2 - 1, y: size.height/2 - 2 }, {
                width: 3,
                height: 5,
            })

        viewport.centerOn({ x: size.width/2, y: size.height/2 })
    }

    onStop(engine: Engine.IGameEngine): void {
        console.log("onStop", engine)
    }
}

export * as Resources from "./resources"
export * as Land from "./land"
