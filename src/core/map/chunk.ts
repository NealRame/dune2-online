import { createChunkImage } from "./workers"

import { AbstractSceneItem } from "@/core/scene-item"
import { Image, ScaleFactor } from "@/core/types"
import { Painter } from "@/graphics"
import { Rect, Size } from "@/maths"

import { isNil } from "lodash"

export class Chunk extends AbstractSceneItem {
    private image_: Image|null = null

    constructor(chunkRect: Rect, image: Image) {
        super(chunkRect)
        this.image_ = image
    }

    set image(image: Image) {
        this.image_ = image
    }

    render(
        painter: Painter,
        gridSpacing: number,
        scale: ScaleFactor,
        viewport: Rect
    ): Chunk {
        if (!isNil(this.image_)) {
            painter.drawImageBitmap(
                this.image_[scale],
                this.position.sub(viewport.topLeft()).mul(gridSpacing),
            )
        }
        return this
    }
}

export async function createChunk(
    chunkRect: Rect,
    mapSize: Size,
    images: Image[]
): Promise<Chunk> {
    const image = await createChunkImage({
        chunkPosition: {
            x: chunkRect.x,
            y: chunkRect.y,
        },
        chunkSize: {
            width: chunkRect.width,
            height: chunkRect.height,
        },
        mapSize,
        images
    })
    return new Chunk(chunkRect, image)
}
