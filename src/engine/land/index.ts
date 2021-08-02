import { positionToIndexConverter } from "./utils"

import { AbstractSceneItem } from "@/engine/scene"
import { Image, Neighborhood, Scene, SceneItem, Terrain } from "@/engine/types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { isNil } from "lodash"

function * rectIterator(rect: Rect) {
    for (let y = rect.y; y < rect.y + rect.height; ++y) {
        for (let x = rect.x; x < rect.x + rect.width; ++x) {
            yield { x, y }
        }
    }
}

class Chunk extends AbstractSceneItem {
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
    ): Chunk {
        const scale = this.scene.scale
        const gridSpacing = this.scene.gridSpacing
        const rect = this.rect

        if (isNil(this.image_[scale])) {
            const canvas = new OffscreenCanvas(gridSpacing*rect.width, gridSpacing*rect.height)
            const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

            for (const position of rectIterator(rect)) {
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

export class Land implements SceneItem {
    private chunks_: Chunk[]
    private scene_: Scene
    private size_: Size
    private terrains_: Terrain[]

    private positionToIndex_: (p: RectangularCoordinates) => number

    constructor(
        scene: Scene,
        size: Size,
        terrains: Terrain[]
    ) {
        this.scene_ = scene
        this.size_ = size
        this.terrains_ = terrains
        this.chunks_ = []
        this.positionToIndex_ = positionToIndexConverter(size)

        const chunkSize = { width: 32, height: 32 }

        for (let y = 0; y < size.height; y += chunkSize.height) {
            for (let x = 0; x < size.width; x += chunkSize.width) {
                const width = Math.min(chunkSize.width, size.width - x)
                const height = Math.min(chunkSize.height, size.height - y)
                const chunkZone = new Rect({ x, y }, { width, height })

                this.chunks_.push(new Chunk(this, chunkZone))
            }
        }
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

    update(): Land {
        return this
    }

    render(
        painter: Painter,
        viewport: Rect
    ): Land {
        for (const chunk of this.chunks_) {
            if (viewport.intersects(chunk.rect)) {
                chunk.render(painter, viewport)
            }
        }
        return this
    }

    terrain<T extends Terrain = Terrain>(
        position: RectangularCoordinates
    ): T|null {
        return this.terrains_[this.positionToIndex_(position)] as T
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
