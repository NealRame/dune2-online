import { ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

export abstract class AbstractSceneItem implements SceneItem {
    x = 0
    y = 0
    private items_: SceneItem[] = []
    private parent_: Scene | SceneItem | null = null

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

    abstract get size(): Size

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

    update(): AbstractSceneItem {
        return this
    }

    render(painter: Painter, viewport: Rect): SceneItem {
        for (const item of this.items_) {
            item.render(painter, viewport)
        }
        return this
    }
}
