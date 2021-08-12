import { Land, LandConfig, Terrain, TerrainGenerator } from "./types"
import { createPositionToZoneConverter } from "./utils"
import { Zone } from "./zone"

import { createObserver, Observer } from "@/utils"

import { Scene } from "@/engine"
import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { chain, isNil } from "lodash"

export function * zoneIterator(
    rect: Rect|null,
    zoneSize: Size = { width: 1, height: 1 },
): Generator<Rect> {
    if (isNil(rect)) return
    for (let y = rect.y; y < rect.y + rect.height; y += zoneSize.height) {
        for (let x = rect.x; x < rect.x + rect.width; x += zoneSize.width) {
            const width = Math.min(zoneSize.width, rect.width - x)
            const height = Math.min(zoneSize.height, rect.height - y)

            yield new Rect({ x, y }, { width, height })
        }
    }
}

export function generateLandTerrains<T extends Terrain>(
    land: Land<T>,
    generateTerrain: TerrainGenerator<T>,
): T[] {
    const terrains: T[] = []
    for (const { x, y } of zoneIterator(land.rect)) {
        terrains.push(generateTerrain(land, { x, y }))
    }
    return terrains
}

export function generateLandZones<T extends Terrain>(
    land: Land<T>,
    chunkSize: Size,
): Zone[] {
    const zones: Zone[] = []
    for (const rect of zoneIterator(land.rect, chunkSize)) {
        const zone = new Zone(land.scene, rect)
        for (const terrain of land.terrains(rect)) {
            zone.refresh(terrain)
        }
        zone.update()
        zones.push(zone)
    }
    return zones
}

export class LandImpl<T extends Terrain> implements Land<T> {
    private scene_: Scene
    private size_: Size

    private terrains_: T[]
    private terrainsObserver_: Observer<T>

    private zoneSize_: Size = { width: 32, height: 32 }
    private zones_: Zone[]

    private positionToTerrainIndex_: (p: RectangularCoordinates) => number
    private positionToZoneIndex_: (p: RectangularCoordinates) => number

    private onTerrainChanged_(terrain: T) {
        const zones = new Set<Zone>()
        chain(terrain.neighbors)
            .tap(terrains => terrains.push(terrain))
            .forEach(terrain => {
                if (!isNil(terrain)) {
                    const zone = this.zones_[this.positionToZoneIndex_(terrain.position)]
                    zone.refresh(terrain)
                    zones.add(zone)
                }
            })
            .value()

        for (const zone of zones) {
            zone.update()
        }
    }

    constructor(
        scene: Scene,
        config: LandConfig,
        generateTerrain: TerrainGenerator<T>,
    ) {
        this.scene_ = scene
        this.size_ = config.size
        this.zoneSize_ = config.zoneSize ?? this.zoneSize_

        this.positionToTerrainIndex_ = createPositionToZoneConverter(this.size_)
        this.positionToZoneIndex_ = createPositionToZoneConverter(this.size_, this.zoneSize_)

        this.terrains_ = generateLandTerrains(this, generateTerrain)
        this.terrainsObserver_ = createObserver()
        this.terrainsObserver_.subscribe(terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.zones_ = generateLandZones(this, this.zoneSize_)
    }

    get scene(): Scene {
        return this.scene_
    }

    get position(): Vector {
        return Vector.Null()
    }

    get width(): number {
        return this.size_.width
    }

    get height(): number {
        return this.size_.height
    }

    get size(): Size {
        return {
            width: this.size_.width,
            height: this.size_.height,
        }
    }

    get rect(): Rect {
        return new Rect({ x: 0, y: 0 }, this.size)
    }

    get terrainsObserver(): Observer<T> {
        return this.terrainsObserver_
    }

    update(): this {
        return this
    }

    render(
        painter: Painter,
        viewport: Rect,
    ): this {
        for (const chunk of this.zones_) {
            if (viewport.intersects(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }

    terrain(position: RectangularCoordinates): T|null {
        return this.terrains_[this.positionToTerrainIndex_(position)] as T
    }

    * terrains(
        rect: Rect,
    ): Generator<T> {
        for (const { x, y } of zoneIterator(this.rect.intersected(rect))) {
            yield this.terrain({ x, y }) as T
        }
    }
}

export function createLand<T extends Terrain>(
    scene: Scene,
    landConfig: LandConfig,
    terrainGenerator: TerrainGenerator<T>,
): Land<T> {
    return new LandImpl(scene, landConfig, terrainGenerator)
}
