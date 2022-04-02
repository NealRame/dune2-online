import { renderImage } from "./workers"

import {
    createPositionToIndexConverter,
    PositionToIndexConverter
} from "@/engine/land/utils"

import { SceneItem } from "@/engine/scene/item"
import { Image, IScene } from "@/engine/scene/types"

import { Painter } from "@/graphics"

import { IVector2D, Rect } from "@/maths"

import { isNil } from "lodash"

export class Chunk extends SceneItem {
    private rect_: Rect
    private image_: Partial<Image> = {}
    private refresh_: Record<number, [IVector2D, Array<Image>]> = {}

    private positionToIndex_: PositionToIndexConverter

    constructor(
        scene: IScene,
        rect: Rect,
    ) {
        super(scene)
        this.rect_ = rect
        this.positionToIndex_ = createPositionToIndexConverter(this.size)
    }

    get x(): number {
        return this.rect_.x
    }

    get y(): number {
        return this.rect_.y
    }

    get width(): number {
        return this.rect_.width
    }

    get height(): number {
        return this.rect_.height
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
