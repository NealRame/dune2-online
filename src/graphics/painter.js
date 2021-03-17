import isNumber from "lodash/isNumber"
import isString from "lodash/isString"

/**
 * @typedef {import("../graphics/surface").default} Surface
 * @typedef {import("../maths/rect").default} Rect
 */

export default class Painter {
    #context

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    constructor(context) {
        this.#context = context
    }

    get size() {
        const {width, height} = this.#context.canvas
        return {
            width,
            height
        }
    }

    get pen() {
        return {
            lineWidth: this.#context.lineWidth,
            strokeStyle: this.#context.strokeStyle,
        }
    }
    set pen(pen) {
        if (isNumber(pen)) {
            this.#context.lineWidth = pen
        } else if (isString(pen)) {
            this.#context.strokeStyle = pen
        } else {
            const {lineWidth, strokeStyle} = pen
            this.#context.lineWidth = lineWidth
            this.#context.strokeStyle = strokeStyle
        }
    }

    get brush() {
        return this.#context.fillStyle
    }
    set brush(brush) {
        this.#context.fillStyle = brush
    }

    // Drawing routines
    clear(brush) {
        this.#context.save()
        this.#context.fillStyle = brush
        this.#context.fillRect(0, 0, this.#context.canvas.width, this.#context.canvas.height)
        this.#context.restore()
        return this
    }
    drawLine({x: x1, y: y1}, {x: x2, y: y2}) {
        this.#context.beginPath()
        this.#context.moveTo({x: x1, y: y1})
        this.#context.lineTo({x: x2, y: y2})
        this.#context.stroke()
        return this
    }
    drawRect({x, y, width, height}) {
        this.#context.beginPath()
        this.#context.moveTo(x, y)
        this.#context.lineTo(x + width, y)
        this.#context.lineTo(x + width, y + height)
        this.#context.lineTo(x, y + height)
        this.#context.closePath()
        this.#context.stroke()
        return this
    }
    fillRect({x, y, width, height}) {
        this.#context.beginPath()
        this.#context.moveTo(x, y)
        this.#context.lineTo(x + width, y)
        this.#context.lineTo(x + width, y + height)
        this.#context.lineTo(x, y + height)
        this.#context.closePath()
        this.#context.fill()
        return this
    }
    /**
     * 
     * @param {Surface} surface 
     * @param {Rect} src_rect
     * @param {Rect} dst_rect
     * @returns {Painter} this Painter
     */
    drawSurface(surface, src_rect, dst_rect) {
        const image = surface.imageData()
        this.#context.putImageData(
            image,
            dst_rect.leftX, dst_rect.topY,
            src_rect.leftX, src_rect.topY,
            src_rect.width, src_rect.height
        )
        return this
    }
}
