import { Rect, IVector2D, ISize } from "@/maths"

import { isNil } from "lodash"

export interface Pen {
    lineWidth: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
}

export type Brush = string | CanvasGradient | CanvasPattern

export class PainterError extends Error {
    constructor(m: string) {
        super(m)
        Object.setPrototypeOf(this, PainterError.prototype)
    }
}

export class Painter {
    private canvas_: HTMLCanvasElement | OffscreenCanvas
    private context_: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

    /**
     * @param paintDevice
     */
    constructor(
        canvas: HTMLCanvasElement | OffscreenCanvas
    ) {
        this.canvas_ = canvas
        if (canvas instanceof HTMLCanvasElement) {
            this.context_ = canvas.getContext("2d") as CanvasRenderingContext2D
        } else if (canvas instanceof OffscreenCanvas) {
            this.context_ = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D
        } else {
            throw new PainterError("Unsupported canvas")
        }
    }

    get size(): ISize {
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

    translate({ x, y }: IVector2D): Painter {
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
        { x: x1, y: y1 }: IVector2D,
        { x: x2, y: y2 }: IVector2D,
    ): Painter {
        this.context_.beginPath()
        this.context_.moveTo(x1, y1)
        this.context_.lineTo(x2, y2)
        this.context_.stroke()
        return this
    }

    drawRect(
        { x, y }: IVector2D,
        { width, height }: ISize,
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
        { x, y }: IVector2D,
        { width, height }: ISize,
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
        { x, y }: IVector2D,
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
        { x, y }: IVector2D,
        srcRect?: Rect,
        dstSize?: ISize,
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
