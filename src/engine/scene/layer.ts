import { IScene, ISceneItem, ISceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export class SceneLayerImpl implements ISceneLayer {
    private items_: ISceneItem[] = []
    private scene_: IScene
    name: string

    constructor(scene: IScene, name = "") {
        this.scene_ = scene
        this.name = name
    }

    get position()
        : Vector {
        return Vector.Null
    }

    get width()
        : number {
        return this.scene_.width
    }

    get height()
        : number {
        return this.scene_.height
    }

    get size()
        : ISize {
        return this.scene_.size
    }

    get rect()
        : Rect {
        return this.scene_.rect
    }

    get scene()
        : IScene {
        return this.scene_
    }

    addItem(item: ISceneItem)
        : ISceneLayer {
        this.items_.push(item)
        return this
    }

    * items()
        : Generator<ISceneItem> {
        for (const item of this.items_) {
            yield item
        }
    }

    render(painter: Painter, viewport: Rect)
        : ISceneLayer {
        for (const item of this.items_) {
            if (viewport.intersects(item.rect)) {
                item.render(painter, viewport)
            }
        }
        return this
    }

    update()
        : ISceneLayer {
        for (const item of this.items_) {
            item.update()
        }
        return this
    }
}
