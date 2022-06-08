import { IScene, ISceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, ISize2D, Vector } from "@/maths"

export abstract class SceneItem implements ISceneItem {
    private scene_: IScene

    protected height_ = 0
    protected width_ = 0

    visible = true

    constructor(scene: IScene) {
        this.scene_ = scene
    }

    get scene(): IScene {
        return this.scene_
    }

    get x(): number {
        return 0
    }

    get y(): number {
        return 0
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
    }

    get size(): ISize2D {
        return {
            width: this.width,
            height: this.height,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    abstract render(painter: Painter, viewport: Rect): ISceneItem
}
