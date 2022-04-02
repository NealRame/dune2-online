import {
    Terrain
} from "./terrain"
import {
    type ILand,
    type ILandEvent,
    type ILandTerrainGenerator,
    type ILandTerrainTilesProvider,
    type ITerrainData,
    type ITerrain,
    type Neighborhood,
} from "./types"
import {
    createPositionToIndexConverter,
    createIndexToPositionConverter,
    IndexToPositionConverter,
    PositionToIndexConverter,
} from "./utils"

import { LandChunkView } from "./view/chunk-view"
import { LandEditorView } from "./view/editor-view"

import { Entity } from "@/engine/entity"
import {
    Inject,
    Service,
    ServiceLifecycle,
} from "@/engine/injector"
import {
    GameLandTerrainGenerator,
    GameLandTilesProvider,
    GameMode,
    GameScene,
} from "@/engine/constants"
import {
    type IScene,
    type ISceneItem
} from "@/engine/scene"
import {
    GameEngineMode,
} from "@/engine/types"

import {
    Rect,
    type ISize2D,
    type IVector2D,
} from "@/maths"

import { createObservable, IEmitter, IObservable } from "@/utils"

import { isNil } from "lodash"

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

@Service({
    lifecycle: ServiceLifecycle.Singleton,
})
export class Land<TerrainData extends ITerrainData> extends Entity implements ILand<TerrainData> {
    private size_: ISize2D
    private indexToPosition_: IndexToPositionConverter
    private positionToIndex_: PositionToIndexConverter

    private events_: IObservable<ILandEvent<TerrainData>>
    private emitter_: IEmitter<ILandEvent<TerrainData>>

    private terrains_: Array<Terrain<TerrainData>> = []
    private view_: ISceneItem

    constructor(
        @Inject(GameLandTerrainGenerator) private terrainGenerator_: ILandTerrainGenerator<TerrainData>,
        @Inject(GameLandTilesProvider) private tilesProvider_: ILandTerrainTilesProvider<TerrainData>,
        @Inject(GameMode) gameMode: GameEngineMode,
        @Inject(GameScene) scene: IScene,
    ) {
        super()

        this.size_ = scene.size
        this.indexToPosition_ = createIndexToPositionConverter(this.size_)
        this.positionToIndex_ = createPositionToIndexConverter(this.size_)

        const [emitter, events] = createObservable<ILandEvent<TerrainData>>()

        this.emitter_ = emitter
        this.events_ = events

        this.view_ = gameMode === GameEngineMode.Editor
            ? new LandEditorView(this, this.tilesProvider_, scene)
            : new LandChunkView(this, this.tilesProvider_, scene)
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

    reset(): this {
        this.terrains_ = this.terrainGenerator_.generate(this.size_).map((data, index) => {
            return new Terrain(this.indexToPosition_(index), data, this)
        })
        return this
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
}
