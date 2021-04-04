import { PaintDevice } from "./types"
import { Surface } from "./surface"

import { Rect, RectangularCoordinates, Size } from "@/maths"

import { isNil } from "lodash"

export interface Pen {
    lineWidth: number,
    strokeStyle: string | CanvasGradient | CanvasPattern,
}

export type Brush = string | CanvasGradient | CanvasPattern

export class Painter {
    private paintDevice_: PaintDevice

    /**
     * @param paintDevice
     */
    constructor(paintDevice: PaintDevice) {
        this.paintDevice_ = paintDevice
    }

    get size(): Size {
        const { width, height } = this.paintDevice_.canvas
        return {
            width,
            height,
        }
    }

    get pen(): Pen {
        const context = this.paintDevice_.context
        return {
            lineWidth: context.lineWidth,
            strokeStyle: context.strokeStyle,
        }
    }

    set pen(pen: Pen) {
        const { lineWidth, strokeStyle } = pen
        const context = this.paintDevice_.context
        context.lineWidth = lineWidth
        context.strokeStyle = strokeStyle
    }

    get brush(): Brush {
        const context = this.paintDevice_.context
        return context.fillStyle
    }

    set brush(brush: Brush) {
        const context = this.paintDevice_.context
        context.fillStyle = brush
    }

    // Drawing routines

    clear(brush: Brush): Painter {
        const { width, height } = this.size
        const context = this.paintDevice_.context
        context.save()
        context.fillStyle = brush
        context.fillRect(0, 0, width, height)
        context.restore()
        return this
    }

    drawLine(
        { x: x1, y: y1 }: RectangularCoordinates,
        { x: x2, y: y2 }: RectangularCoordinates,
    ): Painter {
        const context = this.paintDevice_.context
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
        return this
    }

    drawRect(
        { x, y }: RectangularCoordinates,
        { width, height }: Size,
    ): Painter {
        const context = this.paintDevice_.context
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + width, y)
        context.lineTo(x + width, y + height)
        context.lineTo(x, y + height)
        context.closePath()
        context.stroke()
        return this
    }

    fillRect(
        { x, y }: RectangularCoordinates,
        { width, height }: Size,
    ): Painter {
        const context = this.paintDevice_.context
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + width, y)
        context.lineTo(x + width, y + height)
        context.lineTo(x, y + height)
        context.closePath()
        context.fill()
        return this
    }

    drawSurface(
        surface: Surface,
        { x, y }: RectangularCoordinates,
        srcRect?: Rect
    ): Painter {
        const context = this.paintDevice_.context
        const image = surface.imageData()
        srcRect = isNil(srcRect) ? surface.rect : srcRect
        context.putImageData(
            image,
            x, y,
            srcRect.leftX, srcRect.topY,
            srcRect.width, srcRect.height
        )
        return this
    }
}
