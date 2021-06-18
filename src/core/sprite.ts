import { AbstractSceneItem } from "./scene-item"
import { Tile } from "./tile"
import { ScaleFactor } from "./types"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

import { isNil } from "lodash"

type SpriteUpdateDelegate = () => void

export class Sprite extends AbstractSceneItem {
    private frames_: Tile[]
    private frameIndex_: number

    constructor(position: RectangularCoordinates) {
        super(new Rect(position, { width: 0, height: 0 }))
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

    get size(): Size {
        return {
            width: this.width,
            height: this.height,
        }
    }

    addFrame(frame: Tile): Sprite {
        this.frames_.push(frame)
        const { width, height } = this.frames_.reduce(
            (rect, frame) => rect.united(frame.rect),
            new Rect({ x: 0, y: 0 }, { width: 0, height: 0 })
        )
        this.width = width
        this.height = height
        return this
    }

    update(): Sprite {
        return this
    }

    render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): Sprite {
        painter.save()
        painter.translate(this.position.sub(viewport.topLeft()).mul(gridSpacing))

        if (this.frameIndex_ <= this.frames_.length) {
            this.frames_[this.frameIndex_].render(
                painter,
                gridSpacing,
                scale,
                new Rect(Vector.Null(), this.size)
            )
        }

        painter.restore()

        return this
    }
}

export type SpriteConfig = {
    position?: RectangularCoordinates,
    onUpdate?: SpriteUpdateDelegate,
    frames?: Tile[],
}

export function createSprite(config: SpriteConfig): Sprite {
    const position = config.position ?? { x: 0, y: 0 }
    const frames = config.frames ?? []
    const sprite = isNil(config.onUpdate)
        ? new Sprite(position)
        : new (class extends Sprite {
            update() {
                (config.onUpdate as SpriteUpdateDelegate).call(this)
                return this
            }
        })(position)

    for (const frame of frames) {
        sprite.addFrame(frame)
    }

    return sprite
}
