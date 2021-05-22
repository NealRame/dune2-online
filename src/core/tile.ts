import { Image, ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

export class Tile implements SceneItem {
    x: number
    y: number

    private parent_: Scene | SceneItem | null
    private image_: Image

    constructor(image: Image) {
        this.parent_ = null

        this.x = 0
        this.y = 0
        this.image_ = image
    }

    get position(): RectangularCoordinates {
        return {
            x: this.x,
            y: this.y,
        }
    }

    set position({ x, y }: RectangularCoordinates) {
        this.x = x
        this.y = y
    }

    get size(): Size {
        return {
            width: this.image_[this.scale].width,
            height: this.image_[this.scale].height,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    get scale(): ScaleFactor {
        return this.parent?.scale ?? 1
    }

    get parent(): Scene | SceneItem | null {
        return this.parent_
    }

    set parent(p: Scene | SceneItem | null) {
        this.parent_ = p
    }

    render(painter: Painter): Tile {
        painter.drawImageBitmap(this.image_[this.scale], this.position)
        return this
    }
}

export function createTile(
    position: RectangularCoordinates,
    image: Image,
): Tile {
    const tile = new Tile(image)
    tile.position = position
    return tile
}
