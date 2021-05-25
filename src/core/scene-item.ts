import { ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

export abstract class AbstractSceneItem implements SceneItem {
    x = 0
    y = 0
    private items_: SceneItem[] = []
    private parent_: Scene | SceneItem | null = null

    constructor(position: RectangularCoordinates) {
        this.position = position
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

    get parent(): Scene | SceneItem | null {
        return this.parent_
    }

    set parent(p: Scene | SceneItem | null) {
        this.parent_ = p
    }

    abstract getSize(scale: ScaleFactor): Size

    getRect(scale: ScaleFactor): Rect {
        return new Rect(this.position, this.getSize(scale))
    }

    update(): AbstractSceneItem {
        return this
    }

    render(painter: Painter, scale: ScaleFactor, viewport: Rect): SceneItem {
        for (const item of this.items_) {
            item.render(painter, scale, viewport)
        }
        return this
    }
}
