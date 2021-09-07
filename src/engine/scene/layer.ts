import { Scene, SceneItem, SceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect, ISize } from "@/maths"

export class SceneLayerImpl implements SceneLayer {
    private items_: SceneItem[] = []
    private scene_: Scene
    name: string

    constructor(scene: Scene, name = "") {
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
        : Scene {
        return this.scene_
    }

    addItem(item: SceneItem)
        : SceneLayer {
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
        : SceneLayer {
        const viewportRect = this.scene_.viewport.rect
        for (const item of this.items_) {
            item.render(painter, viewportRect)
        }
        return this
    }

    update()
        : SceneLayer {
        for (const item of this.items_) {
            item.update()
        }
        return this
    }
}
