import { AbstractSceneItem } from "./scene-item"
import { Tile } from "./tile"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

import { isNil } from "lodash"
import { ScaleFactor } from "./types"

type SpriteUpdateDelegate = () => void

export class Sprite extends AbstractSceneItem {
    private frames_: Tile[]
    private frameIndex_: number

    constructor(position: RectangularCoordinates) {
        super(position)
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

    getSize(scale: ScaleFactor): Size {
        return this.frames_[this.frameIndex_]?.getSize(scale) ?? 0
    }

    addFrame(frame: Tile): Sprite {
        this.frames_.push(frame)
        frame.position = this.position
        frame.parent = this
        return this
    }

    update(): Sprite {
        return this
    }

    render(painter: Painter, scale: ScaleFactor, viewport: Rect): Sprite {
        painter
            .save()
            .translate(this.position)
        if (this.frameIndex_ <= this.frames_.length) {
            this.frames_[this.frameIndex_].render(painter, scale, viewport)
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
