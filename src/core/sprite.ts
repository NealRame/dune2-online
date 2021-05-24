import { AbstractSceneItem } from "./scene-item"
import { Tile } from "./tile"

import { Painter } from "@/graphics"
import { RectangularCoordinates, Size } from "@/maths"

export class Sprite extends AbstractSceneItem {
    private frames_: Tile[]
    private frameIndex_: number

    constructor() {
        super()
        this.frameIndex_ = 0
        this.frames_ = []
    }

    get size(): Size {
        return this.frames_[this.frameIndex_]?.size ?? 0
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

    addFrame(frame: Tile): Sprite {
        this.frames_.push(frame)
        frame.position = this.position
        frame.parent = this
        return this
    }

    render(painter: Painter): Sprite {
        if (this.frameIndex_ <= this.frames_.length) {
            this.frames_[this.frameIndex_].render(painter)
        }
        return this
    }
}

export function createSprite(
    position: RectangularCoordinates,
    ...frames: Tile[]
): Sprite {
    const sprite = new Sprite()
    sprite.position = position
    for (const frame of frames) {
        sprite.addFrame(frame)
    }
    return sprite
}
