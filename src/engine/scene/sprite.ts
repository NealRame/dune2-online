import { AbstractSceneItem } from "./item"
import { Tile } from "./tile"
import { Image, IScene } from "./types"

import { Painter } from "@/graphics"
import { Rect, IVector2D, ISize, IShape, Vector } from "@/maths"

import { isNil } from "lodash"

type SpriteUpdateDelegate = () => void

export class Sprite extends AbstractSceneItem {
    private frames_: Tile[]
    private frameIndex_: number

    constructor(
        scene: IScene,
        position: IVector2D,
    ) {
        super(scene)
        this.position = position
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

export type SpriteConfig = {
    position?: IVector2D,
    onUpdate?: SpriteUpdateDelegate,
}

export function createSprite(scene: IScene, config: SpriteConfig): Sprite {
    const position = config.position ?? { x: 0, y: 0 }
    const sprite = isNil(config.onUpdate)
        ? new Sprite(scene, position)
        : new (class extends Sprite {
            update() {
                (config.onUpdate as SpriteUpdateDelegate).call(this)
                return this
            }
        })(scene, position)
    return sprite
}
