import { SceneItem } from "./item"
import { Tile } from "./tile"
import { Image, IScene } from "./types"

import { Painter } from "@/graphics"
import { Rect, IVector2D, ISize, IShape, Vector } from "@/maths"

export class Sprite extends SceneItem {
    private frames_: Tile[]
    private frameIndex_: number

    constructor(
        scene: IScene,
        position: IVector2D,
    ) {
        super(scene)
        this.x_ = position.x
        this.y_ = position.y
        this.frames_ = []
        this.frameIndex_ = 0
    }

    get frameCount(): number {
        return this.frames_.length
    }

    get frameIndex(): number {
        return this.frameIndex_
    }

    set frameIndex(index: number) {
        this.frameIndex_ = index
    }

    get size(): ISize {
        return this.frames_[this.frameIndex_]?.size ?? {
            width: 0,
            height: 0,
        }
    }

    addFrame(shape: IShape, images: Image[]): Sprite {
        this.frames_.push(new Tile(
            this.scene,
            { x: 0, y: 0 },
            shape,
            images
        ))
        return this
    }

    render(painter: Painter, viewport: Rect): Sprite {
        const { gridSpacing } = this.scene

        painter.save()
        painter.translate(this.position.sub(viewport.topLeft()).mul(gridSpacing))

        if (this.frameIndex_ <= this.frames_.length) {
            this.frames_[this.frameIndex_].render(
                painter,
                new Rect(Vector.Null, this.size)
            )
        }

        painter.restore()

        return this
    }

    update(): Sprite {
        return this
    }
}
