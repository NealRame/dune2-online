import { createPositionToIndexConverter, PositionToIndexConverter } from "./utils"
import { renderImage } from "./workers"

import { SceneItem } from "@/engine/scene/item"
import { Image, IScene } from "@/engine/scene/types"

import { Painter } from "@/graphics"

import { IVector2D, Rect } from "@/maths"

import { isNil } from "lodash"

export class Chunk extends SceneItem {
    private image_: Partial<Image> = {}
    private refresh_: Record<number, [IVector2D, Array<Image>]> = {}

    private positionToIndex_: PositionToIndexConverter

    constructor(
        scene: IScene,
        rect: Rect,
    ) {
        super(scene)
        this.x_ = rect.x
        this.y_ = rect.y
        this.width_ = rect.width
        this.height_ = rect.height
        this.positionToIndex_ = createPositionToIndexConverter(this.size)
    }

    refresh(position: IVector2D, images: Array<Image>): void {
        const index = this.positionToIndex_(position)
        this.refresh_[index] = [position, images]
    }

    render(
        painter: Painter,
        viewport: Rect,
    ): Chunk {
        const { gridSpacing, scale } = this.scene

        if (!isNil(this.image_[scale])) {
            painter.drawImageBitmap(
                this.image_[scale] as ImageBitmap,
                this.position.sub(viewport).mul(gridSpacing)
            )
        }
        return this
    }

    update(): Chunk {
        const tiles = Object.values(this.refresh_)
        this.refresh_ = {}
        if (tiles.length > 0) {
            renderImage({
                size: this.size,
                gridUnit: this.scene.gridUnit,
                image: this.image_,
                tiles,
            }).then(image => {
                this.image_ = image
            })
        }
        return this
    }
}
