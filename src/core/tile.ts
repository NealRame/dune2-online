import { AbstractSceneItem } from "./scene-item"
import { Image, ScaleFactor } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

import { isMatch } from "lodash"

function imageSize(image: Image, scale: ScaleFactor): Size {
    const { width, height } = image[scale]
    return { width, height }
}

function checkShape({ width, height }: Size, images: Image[]) {
    if (width*height > images.length) {
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
        rect: Rect,
        images: Image[]
    ) {
        super(rect)

        checkShape(this.size, images)
        checkSizeOfImages(images)

        this.images_ = images
    }

    render(painter: Painter, gridSpacing: number, scaleFactor: ScaleFactor, viewport: Rect): Tile {
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                const p = this.position.add({ x, y })
                const r = new Rect(p, { width: 1, height: 1 })

                if (viewport.intersects(r)) {
                    const index = this.width*y + x
                    const bitmap = this.images_[index][scaleFactor]
                    painter.drawImageBitmap(bitmap, p.sub(viewport).mul(gridSpacing))
                }
            }
        }

        return this
    }
}

export type TileConfig = {
    position?: RectangularCoordinates,
    size: Size,
    images: Image[]
}

export function createTile(config: TileConfig): Tile {
    return new Tile(
        new Rect(config.position ?? { x: 0, y: 0 }, config.size),
        config.images
    )
}
