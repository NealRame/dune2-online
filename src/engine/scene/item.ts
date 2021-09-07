import { Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, IRectangularCoordinates, Size, Vector } from "@/maths"

export abstract class AbstractSceneItem implements SceneItem {
    private scene_: Scene
    protected width_ = 0
    protected height_ = 0
    x = 0
    y = 0

    constructor(scene: Scene) {
        this.scene_ = scene
    }

    get scene(): Scene {
        return this.scene_
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    set position({ x, y }: IRectangularCoordinates) {
        this.x = x
        this.y = y
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
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

    abstract render(painter: Painter, viewport: Rect): SceneItem

    update(): AbstractSceneItem {
        return this
    }
}
