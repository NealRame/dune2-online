import {
    GameLandTerrainGenerator,
    GameLandTilesProvider,
    GameScene,
} from "@/engine/constants"

import {
    Terrain
} from "./terrain"
import {
    ILand,
    ILandEvent,
    ILandTerrainGenerator,
    ILandTerrainTilesProvider,
    ITerrainData,
    ITerrain,
    Neighborhood,
} from "./types"
import {
    createPositionToIndexConverter,
    createIndexToPositionConverter,
    IndexToPositionConverter,
    PositionToIndexConverter,
} from "./utils"
import { LandView } from "./view"

import { Entity } from "@/engine/entity"
import { IScene, ISceneItem } from "@/engine/scene"

import { ISize2D, IVector2D, Rect } from "@/maths"

import { isNil } from "lodash"
import { createObservable, IEmitter, IObservable } from "@/utils"
import { Inject } from "../injector"

export class LandConfigurationError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandConfigurationError.prototype)
    }
}

export class LandDataError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, LandDataError.prototype)
    }
}

export class Land<TerrainData extends ITerrainData> extends Entity implements ILand<TerrainData> {
    private size_: ISize2D
    private indexToPosition_: IndexToPositionConverter
    private positionToIndex_: PositionToIndexConverter

    private events_: IObservable<ILandEvent<TerrainData>>
    private emitter_: IEmitter<ILandEvent<TerrainData>>

    private terrains_: Array<Terrain<TerrainData>> = []
    private view_: LandView<TerrainData>

    constructor(
        @Inject(GameLandTerrainGenerator) terrainGenerator: ILandTerrainGenerator<TerrainData>,
        @Inject(GameLandTilesProvider) tilesProvider: ILandTerrainTilesProvider<TerrainData>,
        @Inject(GameScene) scene: IScene,
    ) {
        super()

        this.size_ = scene.size
        this.indexToPosition_ = createIndexToPositionConverter(this.size_)
        this.positionToIndex_ = createPositionToIndexConverter(this.size_)

        const [emitter, events] = createObservable<ILandEvent<TerrainData>>()

        this.emitter_ = emitter
        this.events_ = events
        this.terrains_ = terrainGenerator.generate(this.size_).map((data, index) => {
            return new Terrain(this.indexToPosition_(index), data, this)
        })

        const chunkSize = { width: 16, height: 16 }

        this.view_ = new LandView(this, tilesProvider, chunkSize, scene)
    }

    get events()
        : IObservable<ILandEvent<TerrainData>> {
        return this.events_
    }

    get emitter()
        : IEmitter<ILandEvent<TerrainData>> {
        return this.emitter_
    }

    get size(): ISize2D {
        return this.size_
    }

    get view(): ISceneItem {
        return this.view_
    }

    neighborhood({ x, y }: IVector2D)
        : Neighborhood<TerrainData> {
        return [
            this.terrain({ x, y: y - 1 }),
            this.terrain({ x: x + 1, y }),
            this.terrain({ x, y: y + 1 }),
            this.terrain({ x: x - 1, y }),
        ]
    }

    reveal(position: IVector2D, size?: ISize2D): this {
        size = size ?? { width: 1, height: 1 }
        for (const terrain of this.terrains(new Rect(position, size))) {
            terrain.set({ revealed: true } as Partial<TerrainData>)
        }
        return this
    }

    terrain(position: IVector2D)
        : ITerrain<TerrainData>|null {
        return this.terrains_[this.positionToIndex_(position)] ?? null
    }

    * terrains(zone?: Rect)
        : Generator<ITerrain<TerrainData>, void, undefined> {
        if (!isNil(zone)) {
            const rect = Rect.intersection(this.view.rect, zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as ITerrain<TerrainData>
                }
            }
        } else {
            yield * this.terrains_
        }
    }

    update(): void {
        this.view_.update()
    }
}
