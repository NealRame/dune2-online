import { AbstractSceneItem } from "./item"
import { ISceneItem, ISceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect } from "@/maths"

export class SceneLayer extends AbstractSceneItem implements ISceneLayer {
    private items_: Array<ISceneItem> = []

    addItem(item: ISceneItem)
        : ISceneLayer {
        this.items_.push(item)
        return this
    }

    removeItem(item: ISceneItem)
        : ISceneLayer {
        const index = this.items_.indexOf(item)
        if (index >= 0) {
            this.items_.splice(index, 1)
        }
        return this
    }

    clear()
        : ISceneLayer {
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
        : ISceneLayer {
        for (const item of this.items_) {
            if (item.visible && viewport.intersects(item.rect)) {
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
