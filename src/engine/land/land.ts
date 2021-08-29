import { Land, LandConfig, Terrain, TerrainGenerator } from "./types"
import { createPositionToZoneConverter } from "./utils"
import { Zone } from "./zone"

import { createObserver, Observer } from "@/utils"

import { Scene, SceneItem } from "@/engine"
import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { chain, isNil } from "lodash"

export function generateLandTerrains<T extends Terrain>(
    land: Land<T>,
    generateTerrain: TerrainGenerator<T>,
): T[] {
    const terrains: T[] = []
    for (const { x, y } of land.rect.partition()) {
        terrains.push(generateTerrain(land, { x, y }))
    }
    return terrains
}

export function generateLandZones<T extends Terrain>(
    land: Land<T>,
    chunkSize: Size,
): Zone[] {
    const zones: Zone[] = []
    for (const zoneRect of land.rect.partition(chunkSize)) {
        const zone = new Zone(land.scene, zoneRect)
        for (const terrain of land.terrains(zoneRect)) {
            zone.refresh(terrain)
        }
        zone.update()
        zones.push(zone)
    }
    return zones
}

export class LandImpl<T extends Terrain> implements Land<T> {
    private scene_: Scene

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
        config: LandConfig<T>,
    ) {
        this.scene_ = scene
        this.zoneSize_ = config.zoneSize ?? this.zoneSize_

        const { size } = scene
        this.positionToTerrainIndex_ = createPositionToZoneConverter(size)
        this.positionToZoneIndex_ = createPositionToZoneConverter(size, this.zoneSize_)

        this.terrains_ = generateLandTerrains(this, config.generateTerrain)
        this.terrainsObserver_ = createObserver()
        this.terrainsObserver_.subscribe(terrain => {
            this.onTerrainChanged_(terrain)
        })

        this.zones_ = generateLandZones(this, this.zoneSize_)
    }

    get name(): string {
        return "land"
    }

    * items()
        : Generator<SceneItem> {
        for (const zone of this.zones_) {
            yield zone
        }
    }

    get scene(): Scene {
        return this.scene_
    }

    get position(): Vector {
        return Vector.Null()
    }

    get size(): Size {
        return this.scene_.size
    }

    get rect(): Rect {
        return this.scene_.rect
    }

    get terrainsObserver(): Observer<T> {
        return this.terrainsObserver_
    }

    addItem(): Land<T> {
        return this
    }

    update(): Land<T> {
        return this
    }

    render(
        painter: Painter,
    ): this {
        const viewport = this.scene_.viewport.rect
        for (const chunk of this.zones_) {
            if (viewport.intersects(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }

    reveal(position?: RectangularCoordinates, size?: Size): Land<T> {
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

    terrain(position: RectangularCoordinates): T|null {
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
}

export function createLand<T extends Terrain>(
    scene: Scene,
    landConfig: LandConfig<T>,
): Land<T> {
    return new LandImpl(scene, landConfig)
}
