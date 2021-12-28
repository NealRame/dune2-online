import { SceneItem } from "./item"
import { IScene } from "./types"

import { Painter } from "@/graphics"
import { ISize2D, Rect } from "@/maths"
import { isNil } from "lodash"

export class CompoundItem extends SceneItem {
    private children_: Array<SceneItem> = []

    constructor(
        scene: IScene,
        size: ISize2D,
    ) {
        super(scene)
        this.width_ = size.width
        this.height_ = size.height
    }

    insertItemAt(index: number, item: SceneItem)
        : CompoundItem {
        this.children_.splice(index, 0, item)
        return this
    }

    removeItemAt(index: number)
        : CompoundItem {
        this.children_.splice(index, 1)
        return this
    }

    removeItem(item: SceneItem)
        : CompoundItem {
        const index = this.children_.indexOf(item)
        if (index >= 0) {
            this.removeItemAt(index)
        }
        return this
    }

    pushItem(item: SceneItem)
        : CompoundItem {
        this.children_.push(item)
        return this
    }

    popItem()
        : CompoundItem {
        this.children_.pop()
        return this
    }

    render(painter: Painter, viewport: Rect)
        : CompoundItem {
        const { gridSpacing } = this.scene
        const rect = Rect.intersection(viewport, this.rect)

        if (!isNil(rect)) {
            const origin = rect.topLeft().sub(viewport.topLeft())

            for (const item of this.children_) {
                painter.save()
                painter.translate(item.position.add(origin).mul(gridSpacing))
                item.render(painter, item.rect)
                painter.restore()
            }
        }

        return this
    }
}
