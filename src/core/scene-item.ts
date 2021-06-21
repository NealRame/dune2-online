import { ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"
import { isNil } from "lodash"

export abstract class AbstractSceneItem implements SceneItem {
    private scene_: Scene
    protected width_ = 0
    protected height_ = 0
    x = 0
    y = 0

    constructor(scene: Scene, rect?: Rect) {
        this.scene_ = scene
        if (!isNil(rect)) {
            this.x = rect.x
            this.y = rect.y
            this.width_ = rect.width
            this.height_ = rect.height
        }
    }

    get scene(): Scene {
        return this.scene_
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    set position({ x, y }: RectangularCoordinates) {
        this.x = x
        this.y = y
    }

    get size(): Size {
        return {
            width: this.width_,
            height: this.height_,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    update(): AbstractSceneItem {
        return this
    }

    abstract render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): SceneItem
}
