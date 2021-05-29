import { AbstractSceneItem } from "@/core/scene-item"
import { Image, ScaleFactor, ScaleFactors } from "@/core/types"
import { Painter } from "@/graphics"
import { Rect, RectangularCoordinates } from "@/maths"

function ChunkImageDataCreator(
    chunkRect: Rect,
    images: Image[],
    positionToIndex: (p: RectangularCoordinates) => number,
): (scale: ScaleFactor) => Partial<Record<ScaleFactor, ImageData>> {
    return (scale: ScaleFactor) => {
        const { width, height } = chunkRect
        const canvas = new OffscreenCanvas(16*scale*width, 16*scale*height)
        const context = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D

        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                const index = positionToIndex({
                    x: x + chunkRect.x,
                    y: y + chunkRect.y,
                })
                const image = images[index]
                const bitmap = image[scale]
                context.drawImage(
                    bitmap,
                    x*bitmap.width,
                    y*bitmap.height,
                )
            }
        }

        return { [scale]: context.getImageData(0, 0, canvas.width, canvas.height) }
    }
}

export class Chunk extends AbstractSceneItem {
    private image_: Record<ScaleFactor, ImageData>

    constructor(
        chunkRect: Rect,
        images: Image[],
        positionToIndex: (p: RectangularCoordinates) => number,
    ) {
        super(chunkRect)
        this.image_ = Object.assign({}, ...ScaleFactors.map(
            ChunkImageDataCreator(chunkRect, images, positionToIndex)
        ))
    }

    render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): Chunk {
        const pos = this.position.sub(viewport.topLeft()).mul(gridSpacing)
        painter.drawImageData(this.image_[scale], pos)
        return this
    }
}
