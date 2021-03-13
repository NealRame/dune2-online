import Vector from "../maths/vector"

import is_number from "lodash/isNumber"
import clamp from "lodash/clamp"

/**
 * @typedef {{x: number, y: number}} Point
 * @typedef {{width: number, height: number}} Size
 */

/**
 * @class Rect
 */
export default class Rect {
    #x
    #y
    #width
    #height

    /**
     * Constructs Rect based on the top left point and a size
     * @param {Point} point
     * @param {Size} size
     */
    constructor({x, y}, {width, height}) {
        this.#x = x
        this.#y = y
        this.#width = width
        this.#height = height
    }

    /**
     * @returns {number} the left x coordinate of this Rect
     */
    get x() { return this.#x }

    /**
     * @returns {number} the top y coordinate of this Rect
     */
    get y() { return this.#y }

    /**
     * @returns {number} the width of this Rect
     */
    get width() { return this.#width }

    /**
     * @returns {number} the height of this Rect
     */
    get height() { return this.#height }

    /**
     * @returns {Size} the size to this Rect
     */
    get size() {
        return {
            width: this.#width,
            height: this.#height,
        }
    }

    /**
     * Alias Rect#x
     * @returns {number}
     */
    get leftX() { return this.#x }

    /**
     * @returns {number} the right x coordinate of this Rect
     */
    get rightX() { return this.#x + this.#width }

    /**
     * Alias Rect#y
     * @returns {number}
     */
    get topY() { return this.#y }

    /**
     * @returns {number} the bottom y coordinate of this Rect
     */
    get bottomY() { return this.#y + this.#height }

    /**
     * @returns {Vector} the top left point of this Rect
     */
    topLeft() {
        return new Vector({
            x: this.#x,
            y: this.#y
        })
    }

    /**
     * @returns {Vector} the top right point of this Rect
     */
    topRight() {
        return new Vector({
            x: this.rightX,
            y: this.#y
        })
    }

    /**
     * @returns {Vector} the bottom left point of this Rect
     */
    bottomLeft() {
        return new Vector({
            x: this.#x,
            y: this.#y + this.#height
        })
    }

    /**
     * @returns {Vector} the bottom right point of this Rect
     */
    bottomRight() {
        return new Vector({
            x: this.rightX,
            y: this.bottomY
        })
    }

    /**
     * @returns {Vector} the center point of this Rect
     */
    center() {
        return new Vector({
            x: this.#x + this.#width/2,
            y: this.#y + this.#height/2
        })
    }

    /**
     * 
     * @param {Point} point a Point like object
     * @returns {boolean}
     */
    contains({x, y}) {
        return x >= this.leftX && x <= this.rightX
            && y >= this.bottomY && y <= this.topY
    }

    /**
     * 
     * @param {Rect} rect
     * @returns {boolean}
     */
    intersects(rect) {
        return this.contains(rect.topRight())
            || this.contains(rect.bottomRight())
            || this.contains(rect.bottomLeft())
            || this.contains(rect.topLeft())
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
            {x: this.x + x, y: this.y + y},
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
