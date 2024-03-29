import { SceneItem } from "./item"
import { ISceneItem, ISceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect } from "@/maths"

export class SceneLayer extends SceneItem implements ISceneLayer {
    private items_: Array<ISceneItem> = []

    get width(): number {
        return this.scene.width
    }

    get height(): number {
        return this.scene.height
    }

    addItem(item: ISceneItem): this {
        this.items_.push(item)
        return this
    }

    removeItem(item: ISceneItem): this {
        const index = this.items_.indexOf(item)
        if (index >= 0) {
            this.items_.splice(index, 1)
        }
        return this
    }

    clear()
        : this {
        this.items_ = []
        return this
    }

    * items()
        : Generator<ISceneItem> {
        for (const item of this.items_) {
            yield item
        }
    }

    render(painter: Painter, viewport: Rect)
        : this {
        for (const item of this.items_) {
            if (item.visible && viewport.overlap(item.rect)) {
                item.render(painter, viewport)
            }
        }
        return this
    }
}
