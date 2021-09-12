import { ILand, ILandConfig, ITerrain, TerrainGenerator } from "./types"
import { createPositionToZoneConverter } from "./utils"
import { ChunkItem } from "./chunkItem"

import { createObserver, IObserver } from "@/utils"

import { IScene, ISceneItem } from "@/engine"
import { Painter } from "@/graphics"
import { Rect, IVector2D, ISize, Vector } from "@/maths"

import { chain, isNil, remove } from "lodash"
import { TerrainItem } from "./terrainItem"

export function ensureLandConfiguration<T extends ITerrain>(
    config: ILandConfig<T>,
): Required<ILandConfig<T>> {
    return Object.assign({
        chunkEnabled: true,
        chunkSize: { width: 32, height: 32 },
        fogOfWarEnabled: true,
    }, config)
}

export function generateLandTerrains<T extends ITerrain>(
    land: ILand<T>,
    generateTerrain: TerrainGenerator<T>,
): T[] {
    const terrains: T[] = []
    for (const { x, y } of land.rect.partition()) {
        terrains.push(generateTerrain(land, { x, y }))
    }
    return terrains
}

export function generateLandTerrainItems(
    land: ILand
): Array<ISceneItem> {
    const items: Array<TerrainItem> = []
    for (const terrain of land.terrains()) {
        items.push(new TerrainItem(land.scene, terrain))
    }
    return items
}

export function generateLandChunkItems(
    land: ILand,
    chunkSize: ISize,
): Array<ISceneItem> {
    const chunks: ChunkItem[] = []

    for (const chunkRect of land.rect.partition(chunkSize)) {
        const chunk = new ChunkItem(land.scene, chunkRect)
        for (const terrain of land.terrains(chunkRect)) {
            chunk.refresh(terrain)
        }
        chunk.update()
        chunks.push(chunk)
    }

    const positionToChunkIndex = createPositionToZoneConverter(land.size, chunkSize)

    land.onTerrainChanged(terrain => {
        chain(terrain.neighbors as Array<ITerrain>)
            .tap(terrains => remove(terrains, isNil))
            .tap(terrains => terrains.push(terrain))
            .map(terrain => {
                const chunk = chunks[positionToChunkIndex(terrain.position)]
                chunk.refresh(terrain)
                return chunk
            })
            .uniq()
            .forEach(chunk => chunk.update())
            .value()
    })

    return chunks
}

export function generateLandItems<T extends ITerrain>(
    land: ILand<T>,
    config: Required<ILandConfig<T>>
): Array<ISceneItem> {
    return config.chunkEnabled
        ? generateLandChunkItems(land, config.chunkSize)
        : generateLandTerrainItems(land)
}

export class LandImpl<T extends ITerrain> implements ILand<T> {
    private fogOfWar_: boolean
    private items_: ISceneItem[]
    private positionToTerrainIndex_: (p: IVector2D) => number
    private scene_: IScene
    private terrains_: T[]
    private terrainsObserver_: IObserver<T>

    constructor(
        scene: IScene,
        config: ILandConfig<T>,
    ) {
        this.fogOfWar_ = config.fogOfWarEnabled ?? true
        this.positionToTerrainIndex_ = createPositionToZoneConverter(scene.size)
        this.scene_ = scene
        this.terrainsObserver_ = createObserver()
        this.terrains_ = generateLandTerrains(this, config.generateTerrain)
        this.items_ = generateLandItems(this, ensureLandConfiguration(config))
    }

    get name(): string {
        return "land"
    }

    * items()
        : Generator<ISceneItem> {
        for (const zone of this.items_) {
            yield zone
        }
    }

    get scene(): IScene {
        return this.scene_
    }

    get position(): Vector {
        return Vector.Null
    }

    get width(): number {
        return this.scene_.width
    }

    get height(): number {
        return this.scene_.height
    }

    get size(): ISize {
        return this.scene_.size
    }

    get rect(): Rect {
        return this.scene_.rect
    }

    get fogOfWar(): boolean {
        return this.fogOfWar_
    }

    addItem(): ILand<T> {
        return this
    }

    update(): ILand<T> {
        return this
    }

    render(
        painter: Painter,
    ): this {
        const viewport = this.scene_.viewport.rect
        for (const chunk of this.items_) {
            if (viewport.intersects(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }

    reveal(position?: IVector2D, size?: ISize): ILand<T> {
        if (isNil(position)) {
            position = { x: 0, y: 0 }
            size = this.size
        } else {
            size = size ?? { width: 1, height: 1 }
        }
        for (const terrain of this.terrains(new Rect(position, size))) {
            terrain.reveal()
        }
        return this
    }

    terrain(position: IVector2D): T|null {
        return this.terrains_[this.positionToTerrainIndex_(position)] as T
    }

    * terrains(
        zone?: Rect,
    ): Generator<T, void, undefined> {
        if (!isNil(zone)) {
            const rect = this.scene_.rect.intersected(zone)
            if (!isNil(rect)) {
                for (const { x, y } of rect.partition()) {
                    yield this.terrain({ x, y }) as T
                }
            }
        } else {
            yield * this.terrains_
        }
    }

    onTerrainChanged(callback: (t: T) => void): () => void {
        return this.terrainsObserver_.subscribe(callback)
    }

    updateTerrain(
        terrain: T
    ) : ILand<T> {
        this.terrainsObserver_.publish(terrain)
        return this
    }
}

export function createLand<T extends ITerrain>(
    scene: IScene,
    landConfig: ILandConfig<T>,
): ILand<T> {
    return new LandImpl(scene, landConfig)
}
