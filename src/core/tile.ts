import { AbstractSceneItem } from "./scene-item"
import { Image, Shape } from "./types"

import { Painter } from "@/graphics"
import { RectangularCoordinates, Size } from "@/maths"

export class Tile extends AbstractSceneItem {
    private shape_: Shape
    private images_: Image[]

    constructor(shape: Shape, images: Image[]) {
        super()
        if (shape.columns*shape.rows > images.length) {
            throw new Error("Inconsistent number of images for the shape of the sprite")
        }
        this.shape_ = shape
        this.images_ = images
    }

    get size(): Size {
        const bitmap = this.images_[0][this.scale]
        return {
            width: this.shape_.columns*bitmap.width,
            height: this.shape_.rows*bitmap.height,
        }
    }

    render(painter: Painter): Tile {
        const { width, height } = this.images_[0][this.scale]
        for (let row = 0, y = this.position.y; row < this.shape_.rows; row += 1, y += height) {
            for (let col = 0, x = this.position.x; col < this.shape_.columns; col += 1, x += width) {
                const index = this.shape_.columns*row + col
                const scale = this.scale
                const bitmap = this.images_[index][scale]
                painter.drawImageBitmap(bitmap, { x, y })
            }
        }
        return this
    }
}

export function createTile(
    position: RectangularCoordinates,
    shape: Shape,
    images: Image[],
): Tile {
    const tile = new Tile(shape, images)
    tile.position = position
    return tile
}
