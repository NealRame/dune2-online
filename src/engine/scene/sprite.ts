import { SceneItem } from "./item"
import { Tile } from "./tile"

import { Painter } from "@/graphics"
import { ISize, Rect, Vector } from "@/maths"

export abstract class Sprite extends SceneItem {
    protected frames_: Array<Tile> = []

    get frameCount(): number {
        return this.frames_.length
    }

    abstract get frameIndex(): number

    get size(): ISize {
        return this.frames_[this.frameIndex]?.size ?? {
            width: 0,
            height: 0,
        }
    }

    render(painter: Painter, viewport: Rect): Sprite {
        const { gridSpacing } = this.scene

        painter.save()
        painter.translate(this.position.sub(viewport.topLeft()).mul(gridSpacing))

        if (this.frameIndex <= this.frames_.length) {
            this.frames_[this.frameIndex].render(
                painter,
                new Rect(Vector.Null, this.size)
            )
        }

        painter.restore()

        return this
    }
}
