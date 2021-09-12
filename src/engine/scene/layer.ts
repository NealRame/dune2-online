import { ISceneItem, ISceneLayer } from "./types"

import { Painter } from "@/graphics"
import { Rect } from "@/maths"
import { AbstractSceneItem } from "."

export class SceneLayerImpl extends AbstractSceneItem {
    private items_: ISceneItem[] = []

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
