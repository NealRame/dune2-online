import { Surface } from "./surface"

import { Rect, RectangularCoordinates, Size } from "@/maths"

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
        { x: x1, y: y1 }: RectangularCoordinates,
        { x: x2, y: y2 }: RectangularCoordinates,
    ): Painter {
        this.context_.beginPath()
        this.context_.moveTo(x1, y1)
        this.context_.lineTo(x2, y2)
        this.context_.stroke()
        return this
    }

    drawRect(
        { x, y }: RectangularCoordinates,
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
        { x, y }: RectangularCoordinates,
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

    drawSurface(
        surface: Surface,
        { x, y }: RectangularCoordinates,
        srcRect?: Rect
    ): Painter {
        const image = surface.imageBitmap()
        srcRect = isNil(srcRect) ? surface.rect : srcRect
        this.context_.drawImage(
            image,
            srcRect.leftX, srcRect.topY,
            srcRect.width, srcRect.height,
            x, y,
            srcRect.width, srcRect.height
        )
        return this
    }
}
