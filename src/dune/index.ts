import * as Engine from "@/engine"

import * as Resources from "./resources"
import * as Land from "./land"

@Engine.Decorators.Game({
    resources: [
        Resources.Palette,
        Resources.MiscImages,
        Resources.TerrainImages,
        Resources.UnitsImages,
    ],
    land: Land.id,
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
export * as Units from "./units"
