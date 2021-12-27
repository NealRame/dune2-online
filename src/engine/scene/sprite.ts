import { SceneItem } from "./item"
import { Tile } from "./tile"

import { Animation, createTransitionAnimation } from "@/engine/animation"
import { Painter } from "@/graphics"
import { Easing, ISize2D, Rect, Vector } from "@/maths"

import { clamp, isNil } from "lodash"

export class SpriteBase extends SceneItem {
    protected frames_: Array<Tile> = []
    protected frameIndex_ = 0

    get size(): ISize2D {
        return this.frames_[this.frameIndex_]?.size ?? {
            width: 0,
            height: 0,
        }
    }

    render(painter: Painter, viewport: Rect): SpriteBase {
        const { gridSpacing } = this.scene

        painter.save()
        painter.translate(this.position.sub(viewport.topLeft()).mul(gridSpacing))

        if (this.frameIndex_ < this.frames_.length) {
            this.frames_[this.frameIndex_].render(
                painter,
                new Rect(Vector.Null, this.size)
            )
        }

        painter.restore()

        return this
    }
}

export class Sprite extends SpriteBase {
    get frameCount(): number {
        return this.frames_.length
    }

    get frameIndex(): number {
        return this.frameIndex_
    }

    set frameIndex(index: number) {
        this.frameIndex_ = clamp(index, 0, this.frameCount)
    }
}

export class AnimationSprite extends SpriteBase {
    private frameAnimation_: Animation | null = null

    private next_(): void {
        if (isNil(this.frameAnimation_)) {
            this.frameAnimation_ = createTransitionAnimation({
                repeat: this.repeat_,
                easing: Easing.step(this.frames_.length),
                frames: this.frameCount_,
                set: (t: number) => {
                    const index = clamp(Math.floor(t*this.frames_.length), 0, this.frames_.length - 1)
                    this.frameIndex_ = index
                },
                done: () => {
                    this.frameIndex_ = this.frames_.length
                }
            })
        }
        this.frameAnimation_.next()
    }

    protected frameCount_ = 60
    protected repeat_ = false

    render(painter: Painter, viewport: Rect): SpriteBase {
        this.next_()
        return super.render(painter, viewport)
    }
}
