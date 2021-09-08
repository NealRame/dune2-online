import { IScene, ISceneItem } from "./types"

import { Painter } from "@/graphics"
import { Rect, IVector2D, ISize, Vector } from "@/maths"

export abstract class AbstractSceneItem implements ISceneItem {
    private scene_: IScene
    protected width_ = 0
    protected height_ = 0
    x = 0
    y = 0

    constructor(scene: IScene) {
        this.scene_ = scene
    }

    get scene(): IScene {
        return this.scene_
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    set position({ x, y }: IVector2D) {
        this.x = x
        this.y = y
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
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

    update(): AbstractSceneItem {
        return this
    }
}
