import { constant, isNil } from "lodash"

import {
    GameLandTerrainGenerator,
    GameLandTerrainColorProvider,
    GameLandTilesProvider,
    GameMode,
    GameScene,
} from "@/engine/constants"

import {
    Inject,
    type Token,
} from "@/engine/injector"

import {
    type IScene,
    type ISceneItem
} from "@/engine/scene"

import {
    Mode,
    type IGameLandDescriptor,
} from "@/engine/types"

import {
    Rect,
    type ISize2D,
    type IVector2D,
} from "@/maths"

import {
    createObservable,
    type IEmitter,
    type IObservable
} from "@/utils"

import {
    LandConfigurationError,
    LandDataSizeError,
} from "./errors"

import {
    Terrain
} from "./terrain"

import {
    type ILand,
    type ILandConfig,
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

export class Land<
    TerrainDataType extends ITerrainData = ITerrainData,
    LandConfigType extends ILandConfig = ILandConfig,
> implements ILand<TerrainDataType, LandConfigType> {
    private size_: ISize2D
    private indexToPosition_: IndexToPositionConverter
    private positionToIndex_: PositionToIndexConverter

    private events_: IObservable<ILandEvent<TerrainDataType>>
    private emitter_: IEmitter<ILandEvent<TerrainDataType>>

    private terrains_: Array<Terrain<TerrainDataType>> = []
    private view_: ISceneItem

    constructor(
        @Inject(GameLandTerrainGenerator) private terrainGenerator_: ILandTerrainGenerator<TerrainDataType>,
        @Inject(GameLandTilesProvider) private tilesProvider_: ILandTerrainTilesProvider<TerrainDataType>,
        @Inject(GameMode) gameMode: Mode,
        @Inject(GameScene) scene: IScene,
    ) {
        const [emitter, events] = createObservable<ILandEvent<TerrainDataType>>()

        this.indexToPosition_ = constant({ x: 0, y: 0 })
        this.positionToIndex_ = constant(-1)
        this.size_ = { width: 0, height: 0 }
        this.emitter_ = emitter
        this.events_ = events

        this.view_ = gameMode === Mode.Editor
            ? new LandEditorView(this, this.tilesProvider_, scene)
            : new LandChunkView(this, this.tilesProvider_, scene)
    }

    get events()
        : IObservable<ILandEvent<TerrainDataType>> {
        return this.events_
    }

    get emitter()
        : IEmitter<ILandEvent<TerrainDataType>> {
        return this.emitter_
    }

    get size(): ISize2D {
        return this.size_
    }

    get width(): number {
        return this.size_.width
    }

    get height(): number {
        return this.size_.height
    }

    get view(): ISceneItem {
        return this.view_
    }

    load(size: ISize2D, terrains: TerrainDataType[]): this {
        const terrainsLength = terrains.length
        const landArea = size.width*size.height
        if (terrainsLength === landArea) {
            this.indexToPosition_ = createIndexToPositionConverter(size)
            this.positionToIndex_ = createPositionToIndexConverter(size)
            this.size_ = size
            this.terrains_ = terrains.map((data, index) => {
                return new Terrain(this.indexToPosition_(index), data, this)
            })
            this.emitter_.emit("reset", this.size_)
            return this
        }
        throw new LandDataSizeError(terrainsLength, landArea)
    }

    generate(config: LandConfigType): this {
        return this.load(config.size, this.terrainGenerator_.generate(config))
    }

    neighborhood({ x, y }: IVector2D)
        : Neighborhood<TerrainDataType> {
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
            terrain.set({ revealed: true } as Partial<TerrainDataType>)
        }
        return this
    }

    terrain(position: IVector2D)
        : ITerrain<TerrainDataType>|null {
        return this.terrains_[this.positionToIndex_(position)] ?? null
    }

    * terrains(zone?: Rect)
        : Generator<ITerrain<TerrainDataType>, void, undefined> {
        if (!isNil(zone)) {
            const rect = Rect.intersection(this.view.rect, zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as ITerrain<TerrainDataType>
                }
            }
        } else {
            yield * this.terrains_
        }
    }
}

export function define<
    TerrainDataType extends ITerrainData = ITerrainData
>(metadata: IGameLandDescriptor<TerrainDataType>): void {
    Reflect.defineProperty(window, GameLandTerrainColorProvider, {
        value: metadata.ColorsProvider,
    })
    Reflect.defineProperty(window, GameLandTerrainGenerator, {
        value: metadata.Generator,
    })
    Reflect.defineProperty(window, GameLandTilesProvider, {
        value: metadata.TilesProvider
    })
}

export function getMetadata<
    TerrainDataType extends ITerrainData = ITerrainData
>(): IGameLandDescriptor<TerrainDataType> {
    const Generator = Reflect.get(window, GameLandTerrainGenerator)
    if (isNil(Generator)) {
        throw new LandConfigurationError("Land configuration miss Generator property")
    }

    const ColorsProvider = Reflect.get(window, GameLandTerrainColorProvider)
    if (isNil(ColorsProvider)) {
        throw new LandConfigurationError("Land configuration miss ColorsProvider property")
    }

    const TilesProvider = Reflect.get(window, GameLandTilesProvider)
    if (isNil(TilesProvider)) {
        throw new LandConfigurationError("Land configuration miss TilesProvider property")
    }

    return {
        Generator,
        ColorsProvider,
        TilesProvider,
    } as IGameLandDescriptor<TerrainDataType>
}
