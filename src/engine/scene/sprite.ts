import { SceneItem } from "./item"
import { Tile } from "./tile"
import { Image, IScene } from "./types"

import { Painter } from "@/graphics"
import { IShape, ISize, IVector2D, Rect, Vector } from "@/maths"

export class Sprite extends SceneItem {
    private frameIndex_ = 0
    private frames_: Array<Tile> = []

    constructor(
        scene: IScene,
        position: IVector2D,
    ) {
        super(scene)
        this.x_ = position.x
        this.y_ = position.y
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

    addFrame(shape: IShape, images: Array<Image>): Sprite {
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
