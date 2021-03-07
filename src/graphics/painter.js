import is_number from "lodash/isNumber"
import is_string from "lodash/isString"

export default class Painter {
    #context

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     */
    constructor(context) {
        this.#context = context
    }

    get pen() {
        return {
            lineWidth: this.#context.lineWidth,
            strokeStyle: this.#context.strokeStyle,
        }
    }
    set pen(pen) {
        if (is_number(pen)) {
            this.#context.lineWidth = pen
        } else if (is_string(pen)) {
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
    drawRect({topLeft, topRight, bottomLeft, bottomRight}) {
        this.#context.beginPath()
        this.#context.moveTo(topLeft)
        this.#context.lineTo(topRight)
        this.#context.lineTo(bottomRight)
        this.#context.lineTo(bottomLeft)
        this.#context.closePath()
        this.#context.stroke()
        return this
    }
    fillRect({topLeft, topRight, bottomLeft, bottomRight}) {
        this.#context.beginPath()
        this.#context.moveTo(topLeft)
        this.#context.lineTo(topRight)
        this.#context.lineTo(bottomRight)
        this.#context.lineTo(bottomLeft)
        this.#context.closePath()
        this.#context.fill()
        return this
    }
}
