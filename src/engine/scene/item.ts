import { IScene, ISceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export abstract class SceneItem implements ISceneItem {
    private scene_: IScene

    protected x_ = 0
    protected y_ = 0
    protected width_: number
    protected height_: number

    visible = true

    constructor(scene: IScene) {
        this.scene_ = scene
        this.width_ = this.scene_.width
        this.height_ = this.scene_.height
    }

    get scene(): IScene {
        return this.scene_
    }

    get position(): Vector {
        return new Vector(this.x_, this.y_)
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
    }

    get x(): number {
        return this.x_
    }

    get y(): number {
        return this.y_
    }

    get size(): ISize {
        return {
            width: this.width_,
            height: this.height_,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    abstract render(painter: Painter, viewport: Rect): ISceneItem

    update(): ISceneItem {
        return this
    }
}
