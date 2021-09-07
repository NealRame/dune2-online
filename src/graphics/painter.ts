import { Rect, IRectangularCoordinates, Size } from "@/maths"

import { isNil } from "lodash"

export interface Pen {
    lineWidth: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
}

export type Brush = string | CanvasGradient | CanvasPattern

export class Painter {
    private canvas_: HTMLCanvasElement
    private context_: CanvasRenderingContext2D

    /**
     * @param paintDevice
     */
    constructor(canvas: HTMLCanvasElement) {
        this.canvas_ = canvas
        this.context_ = canvas.getContext("2d") as CanvasRenderingContext2D
    }

    get size(): Size {
        const { width, height } = this.canvas_
        return {
            width,
            height,
        }
    }

    get rect(): Rect {
        return new Rect({ x: 0, y: 0 }, this.size)
    }

    get pen(): Pen {
        return {
            lineWidth: this.context_.lineWidth,
            strokeStyle: this.context_.strokeStyle,
        }
    }

    set pen(pen: Pen) {
        const { lineWidth, strokeStyle } = pen
        this.context_.lineWidth = lineWidth
        this.context_.strokeStyle = strokeStyle
    }

    get brush(): Brush {
        return this.context_.fillStyle
    }

    set brush(brush: Brush) {
        this.context_.fillStyle = brush
    }

    // State management

    save(): Painter {
        this.context_.save()
        return this
    }

    restore(): Painter {
        this.context_.restore()
        return this
    }

    // Transformation

    translate({ x, y }: IRectangularCoordinates): Painter {
        this.context_.translate(x, y)
        return this
    }

    // Drawing routines

    clear(brush: Brush): Painter {
        const { width, height } = this.size
        this.context_.save()
        this.context_.fillStyle = brush
        this.context_.fillRect(0, 0, width, height)
        this.context_.restore()
        return this
    }

    drawLine(
        { x: x1, y: y1 }: IRectangularCoordinates,
        { x: x2, y: y2 }: IRectangularCoordinates,
    ): Painter {
        this.context_.beginPath()
        this.context_.moveTo(x1, y1)
        this.context_.lineTo(x2, y2)
        this.context_.stroke()
        return this
    }

    drawRect(
        { x, y }: IRectangularCoordinates,
        { width, height }: Size,
    ): Painter {
        this.context_.beginPath()
        this.context_.moveTo(x, y)
        this.context_.lineTo(x + width, y)
        this.context_.lineTo(x + width, y + height)
        this.context_.lineTo(x, y + height)
        this.context_.closePath()
        this.context_.stroke()
        return this
    }

    fillRect(
        { x, y }: IRectangularCoordinates,
        { width, height }: Size,
    ): Painter {
        this.context_.beginPath()
        this.context_.moveTo(x, y)
        this.context_.lineTo(x + width, y)
        this.context_.lineTo(x + width, y + height)
        this.context_.lineTo(x, y + height)
        this.context_.closePath()
        this.context_.fill()
        return this
    }

    drawImageData(
        imageData: ImageData,
        { x, y }: IRectangularCoordinates,
        srcRect?: Rect
    ): Painter {
        if (isNil(srcRect)) {
            this.context_.putImageData(imageData, x, y)
        } else {
            this.context_.putImageData(
                imageData,
                x, y,
                srcRect.x, srcRect.y,
                srcRect.width, srcRect.height
            )
        }
        return this
    }

    drawImageBitmap(
        imageBitmap: ImageBitmap,
        { x, y }: IRectangularCoordinates,
        srcRect?: Rect,
        dstSize?: Size,
    ): Painter {
        if (isNil(srcRect)) {
            this.context_.drawImage(imageBitmap, x, y)
        } else {
            dstSize = dstSize ?? srcRect.size
            this.context_.drawImage(
                imageBitmap,
                srcRect.leftX, srcRect.topY,
                srcRect.width, srcRect.height,
                x, y,
                dstSize.width, dstSize.height
            )
        }
        return this
    }
}
