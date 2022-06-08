import * as Engine from "@/engine"

import {
    Inject,
    Service,
    type Token,
} from "@/engine/injector"

import { Direction } from "@/maths"

import {
    UnitsImages,
} from "@/dune/resources"

type IHarvesterData = Engine.IDestructibleData & Engine.IMovableData
type IHarvesterEvents = Engine.IDestructibleEvents & Engine.IMovableEvents & Engine.IEntityEvents

export const Harvester: Token<[IHarvesterData, IHarvesterEvents, [Engine.IMovable]]> = Symbol("dune:unit:harvester")

class TileProvider implements Engine.IEntityTileProvider<IHarvesterData> {
    private tiles_: Array<Engine.Tile>

    constructor(
        @Inject(UnitsImages) images: Engine.Image[],
        @Inject(Engine.GameScene) scene: Engine.IScene,
    ) {
        const size = { width: 1.5, height: 1.5 }
        this.tiles_ = [
            new Engine.Tile(scene, size, [images[16]]),
            new Engine.Tile(scene, size, [images[17]]),
            new Engine.Tile(scene, size, [images[19]]),
            new Engine.Tile(scene, size, [images[21]]),
            new Engine.Tile(scene, size, [images[23]]),
            new Engine.Tile(scene, size, [images[22]]),
            new Engine.Tile(scene, size, [images[20]]),
            new Engine.Tile(scene, size, [images[18]]),
        ]
    }

    public getTiles(model: Engine.IModel<IHarvesterData>): Array<Engine.Tile> {
        return [this.tiles_[model.get("direction")]]
    }
}

@Service()
class Hooks implements Engine.IEntityLifecycleHooks<IHarvesterData, IHarvesterEvents> {
    public onDestroyed(): void {
        console.log("Harvester destroyed")
    }

    public onInitialized(): void {
        console.log("Harvester initialized")
    }
}

Engine.Entity.define(Harvester, {
    data: {
        direction: Direction.North,
        health: 100,
        speed: 0.5,
    },
    TileProvider,
    Hooks,
    Mixins: [Engine.Movable]
})
