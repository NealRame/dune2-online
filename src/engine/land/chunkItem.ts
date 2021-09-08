import { Terrain } from "./types"

import { ScaleFactors } from "@/engine/scale"
import { AbstractSceneItem, Image, IScene } from "@/engine/scene"

import { Painter } from "@/graphics"

import { IRectangularCoordinates, Rect } from "@/maths"

import { isNil } from "lodash"

export class ChunkItem extends AbstractSceneItem {
    private image_: Partial<Image> = {}
    private redraw_: [IRectangularCoordinates, Image[]][] = []

    constructor(scene: IScene, rect: Rect) {
        super(scene)
        this.x = rect.x
        this.y = rect.y
        this.width_ = rect.width
        this.height_ = rect.height
    }

    refresh(terrain: Terrain): ChunkItem {
        this.redraw_.push([
            terrain.position,
            terrain.image(),
        ])
        return this
    }

    update(): ChunkItem {
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
    ): ChunkItem {
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
