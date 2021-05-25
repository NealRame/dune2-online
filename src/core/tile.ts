import { AbstractSceneItem } from "./scene-item"
import { Image, ScaleFactor, Shape } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

import { isMatch } from "lodash"

function imageSize(image: Image, scale: ScaleFactor): Size {
    const { width, height } = image[scale]
    return { width, height }
}

function checkShape({ columns, rows }: Shape, images: Image[]) {
    if (columns*rows > images.length) {
        throw new Error("Inconsistent number of images for the shape of the sprite")
    }
}

function checkSizeOfImages(images: Image[]) {
    const [head, ...tail] = images
    const size = imageSize(head, 1)
    for (const image of tail) {
        if (!isMatch(imageSize(image, 1), size)) {
            throw new Error("All image must have the same size")
        }
    }
}

export class Tile extends AbstractSceneItem {
    private images_: Image[]
    private columns_: number
    private rows_: number

    constructor(shape: Shape, images: Image[]) {
        super()

        checkShape(shape, images)
        checkSizeOfImages(images)

        this.columns_ = shape.columns
        this.rows_ = shape.rows
        this.images_ = images
    }

    getSize(scale: ScaleFactor): Size {
        const { width, height } = imageSize(this.images_[0], scale)
        return {
            width: width*this.columns_,
            height: height*this.rows_,
        }
    }

    render(painter: Painter, scale: ScaleFactor, viewport: Rect): Tile {
        const { width, height } = imageSize(this.images_[0], scale)
        for (let row = 0, y = this.y; row < this.rows_; row += 1, y += height) {
            for (let col = 0, x = this.x; col < this.columns_; col += 1, x += width) {
                if (viewport.intersects(new Rect({ x, y }, { width, height }))) {
                    const index = this.columns_*row + col
                    const bitmap = this.images_[index][scale]
                    painter.drawImageBitmap(bitmap, { x, y })
                }
            }
        }
        return this
    }
}

export type TileConfig = {
    position?: RectangularCoordinates,
    shape: Shape,
    images: Image[]
}

export function createTile(config: TileConfig): Tile {
    const position = config.position ?? { x: 0, y: 0 }
    const tile = new Tile(config.shape, config.images)
    tile.position = position
    return tile
}
