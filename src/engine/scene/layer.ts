import { IScene, SceneItem, ISceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect, ISize } from "@/maths"

export class SceneLayerImpl implements ISceneLayer {
    private items_: SceneItem[] = []
    private scene_: IScene
    name: string

    constructor(scene: IScene, name = "") {
        this.scene_ = scene
        this.name = name
    }

    get rect()
        : Rect {
        return this.scene_.rect
    }

    get size()
        : ISize {
        return this.scene_.size
    }

    get scene()
        : IScene {
        return this.scene_
    }

    addItem(item: SceneItem)
        : ISceneLayer {
        this.items_.push(item)
        return this
    }

    * items()
        : Generator<SceneItem> {
        for (const item of this.items_) {
            yield item
        }
    }

    render(painter: Painter)
        : ISceneLayer {
        const viewportRect = this.scene_.viewport.rect
        for (const item of this.items_) {
            item.render(painter, viewportRect)
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
