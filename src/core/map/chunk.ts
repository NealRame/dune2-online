import { createChunkImage } from "./workers"

import { AbstractSceneItem } from "@/core/scene-item"
import { Image, ScaleFactor } from "@/core/types"
import { Painter } from "@/graphics"
import { Rect } from "@/maths"

export class Chunk extends AbstractSceneItem {
    private image_: Image

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
        painter.drawImageBitmap(
            this.image_[scale],
            this.position.sub(viewport.topLeft()).mul(gridSpacing),
        )
        return this
    }
}

export type ChunkConfig = {
    chunkRect: Rect,
    images: Image[]
}

export async function createChunk({
    chunkRect,
    images,
}: ChunkConfig)
    : Promise<Chunk> {
    const image = await createChunkImage({
        chunkSize: chunkRect.size,
        images
    })
    return new Chunk(chunkRect, image)
}
