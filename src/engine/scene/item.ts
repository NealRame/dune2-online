import { IScene, ISceneItem } from "./types"

import { IEntity } from "@/engine/entity"
import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export abstract class SceneItem implements ISceneItem {
    private scene_: IScene

    visible = true

    constructor(scene: IScene) {
        this.scene_ = scene
    }

    get entity(): IEntity | null {
        return null
    }

    get scene(): IScene {
        return this.scene_
    }

    get x(): number {
        return this.entity?.x ?? 0
    }

    get y(): number {
        return this.entity?.y ?? 0
    }

    get width(): number {
        return this.entity?.width ?? 0
    }

    get height(): number {
        return this.entity?.height ?? 0
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    get size(): ISize {
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
