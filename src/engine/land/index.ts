import { createPositionToZoneConverter } from "./utils"

import { AbstractSceneItem } from "@/engine/scene"
import { Image, ScaleFactors, Scene, SceneItem } from "@/engine/types"

import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { chain, isNil } from "lodash"
import { createObserver, Observer } from "@/utils"

function * zoneIterator(
    rect: Rect|null,
    zoneSize: Size = { width: 1, height: 1 },
) {
    if (isNil(rect)) return
    for (let y = rect.y; y < rect.y + rect.height; y += zoneSize.height) {
        for (let x = rect.x; x < rect.x + rect.width; x += zoneSize.width) {
            const width = Math.min(zoneSize.width, rect.width - x)
            const height = Math.min(zoneSize.height, rect.height - y)

            yield {
                position: { x, y },
                size: { width, height },
            }
        }
    }
}

class Zone extends AbstractSceneItem {
    private image_: Partial<Image> = {}
    private redraw_: [RectangularCoordinates, Image[]][] = []

    constructor(scene: Scene, rect: Rect) {
        super(scene)
        this.x = rect.x
        this.y = rect.y
        this.width_ = rect.width
        this.height_ = rect.height
    }

    refresh(terrain: Terrain): Zone {
        this.redraw_.push([
            terrain.position,
            terrain.image(),
        ])
        return this
    }

    update(): Zone {
        const { gridUnit } = this.scene
        const { width, height } = this.rect

        for (const scale of ScaleFactors) {
            const gridSpacing = gridUnit*scale
            const canvas = new OffscreenCanvas(gridSpacing*width, gridSpacing*height)
            const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

            if (!isNil(this.image_[scale])) {
                context.drawImage(this.image_[scale] as ImageBitmap, 0, 0)
            }

            for (const [position, images] of this.redraw_) {
                for (const image of images) {
                    context.drawImage(
                        image[scale],
                        gridSpacing*(position.x - this.x),
                        gridSpacing*(position.y - this.y),
                    )
                }
            }

            this.image_[scale] = canvas.transferToImageBitmap()
        }
        this.redraw_ = []
        return this
    }

    render(
        painter: Painter,
        viewport: Rect,
    ): Zone {
        const { gridSpacing, scale } = this.scene

        if (this.rect.intersects(viewport)) {
            if (!isNil(this.image_[scale])) {
                painter.drawImageBitmap(
                    this.image_[scale] as ImageBitmap,
                    this.position.sub(viewport).mul(gridSpacing)
                )
            }
        }

        return this
    }
}

export type Neighborhood<T extends Terrain> = [T|null, T|null, T|null, T|null]
export type TerrainGenerator = (l: Land, p: RectangularCoordinates) => Terrain
export type TerrainUpdateCallback = (t: Terrain) => void

export type LandConfig = {
    size: Size,
}

export abstract class Terrain {
    protected position_: RectangularCoordinates
    private land_: Land
    private revealed_ = false

    constructor(land: Land, position: RectangularCoordinates) {
        this.land_ = land
        this.position_ = position
    }

    get x(): number {
        return this.position_.x
    }

    get y(): number {
        return this.position_.y
    }

    get position(): RectangularCoordinates {
        return this.position_
    }

    get revealed(): boolean {
        return this.revealed_
    }

    get neighbors(): Neighborhood<Terrain> {
        return this.land_.neighbors(this.position)
    }

    abstract get color(): Color.RGBA
    abstract image(): Image[]

    reveal(): Terrain {
        if (!this.revealed) {
            this.revealed_ = true
            this.update()
        }
        return this
    }

    update(): Terrain {
        this.land_.terrainsObserver.publish(this)
        return this
    }
}

function generateLandTerrains(land: Land, generateTerrain: TerrainGenerator)
    : Terrain[] {
    const terrains: Terrain[] = []
    for (const { position } of zoneIterator(land.rect)) {
        terrains.push(generateTerrain(land, position))
    }
    return terrains
}

function generateLandZones(land: Land, chunkSize: Size)
    : Zone[] {
    const zones: Zone[] = []
    for (const { position, size } of zoneIterator(land.rect, chunkSize)) {
        const zone = new Zone(land.scene, new Rect(position, size))
        for (const terrain of land.terrains(zone.rect)) {
            zone.refresh(terrain)
        }
        zone.update()
        zones.push(zone)
    }
    return zones
}

export class Land implements SceneItem {
    private scene_: Scene
    private size_: Size

    private terrains_: Terrain[]
    private terrainsObserver_: Observer<Terrain>

    private zoneSize_: Size = { width: 32, height: 32 }
    private zones_: Zone[]

    private positionToTerrainIndex_: (p: RectangularCoordinates) => number
    private positionToZoneIndex_: (p: RectangularCoordinates) => number

    private onTerrainChanged_(terrain: Terrain) {
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
        generateTerrain: TerrainGenerator,
    ) {
        const { size } = config

        this.scene_ = scene
        this.size_ = size

        this.positionToTerrainIndex_ = createPositionToZoneConverter(size)
        this.positionToZoneIndex_ = createPositionToZoneConverter(size, this.zoneSize_)

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

    get terrainsObserver(): Observer<Terrain> {
        return this.terrainsObserver_
    }

    update(): Land {
        return this
    }

    render(
        painter: Painter,
        viewport: Rect
    ): Land {
        for (const chunk of this.zones_) {
            if (viewport.intersects(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }

    terrain<T extends Terrain = Terrain>(
        position: RectangularCoordinates
    ): T|null {
        return this.terrains_[this.positionToTerrainIndex_(position)] as T
    }

    * terrains(rect: Rect): Generator<Terrain> {
        for (const { position } of zoneIterator(this.rect.intersected(rect))) {
            yield this.terrain(position) as Terrain
        }
    }

    neighbors<T extends Terrain = Terrain>(
        { x, y }: RectangularCoordinates
    ): Neighborhood<T> {
        return [
            this.terrain({ x, y: y - 1 }),
            this.terrain({ x: x + 1, y }),
            this.terrain({ x, y: y + 1 }),
            this.terrain({ x: x - 1, y }),
        ] as Neighborhood<T>
    }
}
