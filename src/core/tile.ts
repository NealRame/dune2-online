import { AbstractSceneItem } from "./scene-item"
import { Image, ScaleFactor, Shape } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

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

    constructor(
        position: RectangularCoordinates,
        shape: Shape,
        images: Image[]
    ) {
        super(position)

        checkShape(shape, images)
        checkSizeOfImages(images)

        this.width = shape.columns
        this.height = shape.rows
        this.images_ = images
    }

    render(painter: Painter, gridSpacing: number, scaleFactor: ScaleFactor, viewport: Rect): Tile {
        const size = imageSize(this.images_[0], scaleFactor)
        const pos = new Vector(this.x, this.y).mul(gridSpacing)

        for (let row = 0, y = pos.y; row < this.height; row += 1, y += size.height) {
            for (let col = 0, x = pos.x; col < this.width; col += 1, x += size.width) {
                const position = { x, y }
                if (viewport.intersects(new Rect(position, size))) {
                    const index = this.width*row + col
                    const bitmap = this.images_[index][scaleFactor]
                    painter.drawImageBitmap(bitmap, position)
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
    return new Tile(
        config.position ?? { x: 0, y: 0 },
        config.shape,
        config.images
    )
}
