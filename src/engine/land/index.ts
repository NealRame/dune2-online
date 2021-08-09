import { createPositionToZoneConverter } from "./utils"

import { AbstractSceneItem } from "@/engine/scene"
import { Image, Scene, SceneItem } from "@/engine/types"

import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { groupBy, isNil, negate } from "lodash"
import { createObserver, Observer } from "@/utils"

function * zoneIterator(
    rect: Rect,
    zoneSize: Size = { width: 1, height: 1 },
) {
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
    private land_: Land
    private image_: Partial<Image>

    constructor(land: Land, zone: Rect) {
        super(land.scene)
        this.x = zone.x
        this.y = zone.y
        this.width_ = zone.width
        this.height_ = zone.height
        this.land_ = land
        this.image_ = {}
    }

    render(
        painter: Painter,
        viewport: Rect,
    ): Zone {
        const scale = this.scene.scale
        const gridSpacing = this.scene.gridSpacing
        const rect = this.rect

        if (isNil(this.image_[scale])) {
            const canvas = new OffscreenCanvas(gridSpacing*rect.width, gridSpacing*rect.height)
            const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

            for (const { position } of zoneIterator(rect)) {
                const terrain = this.land_.terrain(position)
                if (!isNil(terrain)) {
                    context.drawImage(
                        terrain.image(this.land_.neighbors(position))[scale],
                        gridSpacing*(position.x - this.x),
                        gridSpacing*(position.y - this.y),
                    )
                }
            }

            this.image_[scale] = canvas.transferToImageBitmap()
        }

        if (rect.intersects(viewport)) {
            painter.drawImageBitmap(
                this.image_[scale] as ImageBitmap,
                this.position.sub(viewport).mul(gridSpacing)
            )
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

    get position(): RectangularCoordinates {
        return this.position_
    }

    get revealed(): boolean {
        return this.revealed_
    }

    abstract get color(): Color.RGBA
    abstract image(neighbors: Neighborhood<Terrain>): Image

    reveal(): Terrain {
        this.revealed_ = true
        this.update()
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

function generateChunks(land: Land, chunkSize: Size)
    : Zone[] {
    const zones: Zone[] = []
    for (const { position, size } of zoneIterator(land.rect, chunkSize)) {
        zones.push(new Zone(land, new Rect(position, size)))
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
        const chunks = groupBy(
            [terrain, ...this.neighbors(terrain.position)].filter(negate(isNil)) as Terrain[],
            (terrain) => this.positionToZoneIndex_(terrain.position)
        )
        console.log(chunks)
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

        this.zones_ = generateChunks(this, this.zoneSize_)

        this.terrains_ = generateLandTerrains(this, generateTerrain)
        this.terrainsObserver_ = createObserver()
        this.terrainsObserver_.subscribe(terrain => {
            this.onTerrainChanged_(terrain)
        })
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
