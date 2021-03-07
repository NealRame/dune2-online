import Vector from "../maths/vector"

import is_number from "lodash/isNumber"
import clamp from "lodash/clamp"

/**
 * @typedef {{x: number, y: number}} Point
 */

/**
 * @typedef {{width: number, height: number}} Size
 */

export default class Rect {
    #width
    #height
    #bottomLeft
    #bottomRight
    #center
    #topLeft
    #topRight
    /**
     * 
     * @param {Point} point
     * @param {Size} size
     */
    constructor({x, y}, {width, height}) {
        this.#width = width
        this.#height = height
        this.#bottomLeft  = Vector({x, y: y + height})
        this.#bottomRight = Vector({x: x + width, y: y + height})
        this.#center      = Vector({x: x + width/2, y: y + height/2})
        this.#topLeft     = Vector({x, y})
        this.#topRight    = Vector({x: x + width, y: y})
    }
    get width() { return this.#width }
    get height() { return this.#height }
    get leftX() { return this.#topLeft.x }
    get rightX() { return this.#topRight.x }
    get topY() { return this.#topLeft.y }
    get bottomY() { return this.#bottomLeft.y }
    get topLeft() { return this.#topLeft }
    get topRight() { return this.#topRight }
    get bottomLeft() { return this.#bottomLeft }
    get bottomRight() { return this.#bottomRight }
    get center() { return this.#center }
    get size() {
        return {
            width: this.#width,
            height: this.#height,
        }
    }
    /**
     * 
     * @param {Point} point
     * @returns {boolean}
     */
    contains({x, y}) {
        return x >= this.#bottomLeft.x  && y <= this.#bottomLeft.y
            && x >= this.#topLeft.x     && y >= this.#topLeft.y
            && x <= this.#topRight.x    && y >= this.#topRight.y
            && x <= this.#bottomRight.x && y <= this.#bottomRight.y
    }
    /**
     * 
     * @param {Rect} rect
     * @returns {boolean}
     */
    intersects(rect) {
        return this.contains(rect.topRight)
            || this.contains(rect.bottomRight)
            || this.contains(rect.bottomLeft)
            || this.contains(rect.topLeft)
    }
    /**
     * 
     * @param {Rect} rect 
     * @returns {Rect}
     */
    intersected(rect) {
        return Rect({
            x: clamp(rect.leftX, 0, this.leftX),
            y: clamp(rect.topY, 0, this.topY),
        }, {
            width: clamp(this.width - rect.leftX, 0, rect.width),
            height: clamp(this.height - rect.topY, 0, rect.height),
        })
    }
    /**
     * 
     * @param {Size} size
     * @returns {Rect}
     */
    cropped({width, height}) {
        return Rect({
            x: this.leftX,
            y: this.topY,
        }, {
            width: clamp(this.width, 0, width),
            height: clamp(this.height, 0, height),
        })
    }
    /**
     * 
     * @param {Point} vector
     * @returns {Rect}
     */
    translated({x, y}) {
        return Rect(
            Vector({x: this.topLeft, y: this.topY}).add({x, y}), 
            this.size
        )
    }
    /**
     * 
     * @param {(number | {x: number, y: number})} f scale factor
     * @returns {Rect}
     */
    scaled(f) {
        const {x, y} = is_number(f) ? {x: f, y: f} : f
        return Rect(
            this.topLeft,
            {width: this.width*x, height: this.height*y}
        )
    }
}
