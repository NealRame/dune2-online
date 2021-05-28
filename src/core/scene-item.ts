import { ScaleFactor, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"
import { isNil } from "lodash"

export abstract class AbstractSceneItem implements SceneItem {
    x = 0
    y = 0
    width = 0
    height = 0
    private items_: SceneItem[] = []

    constructor(position?: RectangularCoordinates) {
        if (!isNil(position)) {
            this.position = position
        }
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
            width: this.width,
            height: this.height
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    update(): AbstractSceneItem {
        return this
    }

    render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): SceneItem {
        painter.save()
        painter.translate(this.position)
        for (const item of this.items_) {
            item.render(painter, gridSpacing, scale, viewport)
        }
        painter.restore()
        return this
    }
}
