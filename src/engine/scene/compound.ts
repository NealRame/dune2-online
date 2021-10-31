import { SceneItem } from "./item"
import { IScene } from "./types"

import { Painter } from "@/graphics"
import { ISize, Rect } from "@/maths"
import { isNil, pull } from "lodash"

export class CompoundItem extends SceneItem {
    private children_: Array<SceneItem> = []

    constructor(
        scene: IScene,
        size: ISize,
    ) {
        super(scene)
        this.width_ = size.width
        this.height_ = size.height
    }

    addItem(item: SceneItem)
        : CompoundItem {
        this.children_.push(item)
        return this
    }

    popItem()
        : CompoundItem {
        this.children_.pop()
        return this
    }

    removeItem(item: SceneItem)
        : CompoundItem {
        pull(this.children_, item)
        return this
    }

    render(painter: Painter, viewport: Rect)
        : CompoundItem {
        const { gridSpacing } = this.scene
        const rect = viewport.intersected(this.rect)

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
