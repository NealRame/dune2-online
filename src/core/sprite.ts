import { AbstractSceneItem } from "./scene-item"
import { Tile } from "./tile"

import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

import { noop } from "lodash"
import { ScaleFactor } from "./types"

export class Sprite extends AbstractSceneItem {
    onUpdate: () => void

    private frames_: Tile[]
    private frameIndex_: number

    constructor(
        position: RectangularCoordinates,
        onUpdate: () => void,
    ) {
        super()
        this.frames_ = []
        this.frameIndex_ = 0
        this.onUpdate = onUpdate
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
        this.onUpdate()
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
    onUpdate?(): void,
    frames?: Tile[],
}

export function createSprite(config: SpriteConfig): Sprite {
    const sprite = new Sprite(
        config.position ?? { x: 0, y: 0 },
        config.onUpdate ?? noop
    )
    for (const frame of config.frames ?? []) {
        sprite.addFrame(frame)
    }
    return sprite
}
