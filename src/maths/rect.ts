import { RectangularCoordinates, Size } from "./types"
import { Vector } from "./vector"

import { isNumber, clamp } from "lodash"

/**
 * @class Rect
 */
export class Rect implements RectangularCoordinates, Size {
    x: number
    y: number
    width: number
    height: number

    /**
     * Constructs Rect based on the top left point and a size
     * @param topLeft
     * @param size
     */
    constructor(
        { x, y }: RectangularCoordinates,
        { width, height }: Size
    ) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    /**
     * @returns the size to this Rect
     */
    get size(): Size {
        return {
            width: this.width,
            height: this.height,
        }
    }

    /**
     * @returns the left x coordinate
     */
    get leftX(): number {
        return this.x
    }

    /**
     * @returns the right x coordinate
     */
    get rightX(): number {
        return this.x + this.width
    }

    /**
     * @returns the top y coordinate
     */
    get topY(): number {
        return this.y
    }

    /**
     * @returns the bottom y coordinate
     */
    get bottomY(): number {
        return this.y + this.height
    }

    /**
     * @returns the top left point of this Rect
     */
    topLeft(): Vector {
        return new Vector(this.x, this.y)
    }

    /**
     * @returns the top right point
     */
    topRight(): Vector {
        return new Vector(this.rightX, this.y)
    }

    /**
     * @returns the bottom left point
     */
    bottomLeft(): Vector {
        return new Vector(this.x, this.y + this.height)
    }

    /**
     * @returns the bottom right point
     */
    bottomRight(): Vector {
        return new Vector(this.rightX, this.bottomY)
    }

    /**
     * @returns the center point
     */
    center(): Vector {
        return new Vector(this.x + this.width/2, this.y + this.height/2)
    }

    /**
     * @param point a Point like object
     * @returns true if and only if the given point is contained
     */
    contains({ x, y }: RectangularCoordinates): boolean {
        return x >= this.leftX && x <= this.rightX
            && y >= this.topY  && y <= this.bottomY
    }

    /**
     * @returns a copy of this
     */
    copy(): Rect {
        return new Rect({
            x: this.x,
            y: this.y,
        }, {
            width: this.width,
            height: this.height,
        })
    }

    /**
     * Return true if and only if the given rectangle intersect this rectangle.
     * @param rect
     * @returns boolean
     */
    intersects(rect: Rect): boolean {
        const ax1 = this.leftX
        const ay1 = this.topY
        const ax2 = this.rightX
        const ay2 = this.bottomY
        const bx1 = rect.leftX
        const by1 = rect.topY
        const bx2 = rect.rightX
        const by2 = rect.bottomY
        return ((ax2 >= bx1 && ax2 <= bx2) || (bx2 >= ax1 && bx2 <= ax2))
            && ((ay2 >= by1 && ay2 <= by2) || (by2 >= ay1 && by2 <= ay2))
    }

    /**
     * Returns the result of the intersection of this rectangle and the given
     * one
     * @param rect
     * @returns Rect
     */
    intersected(rect: Rect): Rect {
        return new Rect({
            x: clamp(rect.leftX, 0, this.leftX),
            y: clamp(rect.topY, 0, this.topY),
        }, {
            width: clamp(this.width - rect.leftX, 0, rect.width),
            height: clamp(this.height - rect.topY, 0, rect.height),
        })
    }

    /**
     * Unites this rectangle with the given rectangle.
     * @param rect
     * @returns Rect
     */
    union(rect: Rect): Rect {
        const leftX = Math.min(this.leftX, rect.leftX)
        const rightX = Math.max(this.rightX, rect.rightX)
        const topY = Math.min(this.topY, rect.topY)
        const bottomY = Math.max(this.bottomY, rect.bottomY)
        this.x = leftX
        this.y = topY
        this.width = rightX - leftX
        this.height = bottomY - topY
        return this
    }

    /**
     * Returns the bounding rectangle of this rectangle and the given
     * rectangle.
     * @param rect
     * @returns Rect
     */
    united(rect: Rect): Rect {
        return this.copy().union(rect)
    }

    /**
     * Crop this Rect to the given size.
     * @param size
     * @returns this
     */
    crop({ width, height }: Size): Rect {
        this.width = width
        this.height = height
        return this
    }

    /**
     * @param size
     * @returns a copy of thie Rect that it is cropped to the given size
     */
    cropped({ width, height }: Size): Rect {
        return this.copy().crop({ width, height })
    }

    /**
     * Translate this Rect by the given vector
     * @param vector
     * @returns this
     */
    translate({ x, y }: RectangularCoordinates) : Rect {
        this.x += x
        this.y += y
        return this
    }

    /**
     * @param vector
     * @returns a copy of this Rect that is translated using given vector
     */
    translated({ x, y }: RectangularCoordinates): Rect {
        return this.copy().translate({ x, y })
    }

    /**
     * Scale this rect by the given factor
     * @param k scale factor
     * @returns this
     */
    scale(k: {kx: number, ky: number} | number): Rect {
        const { kx, ky } = isNumber(k) ? { kx: k, ky: k } : k
        this.width *= kx
        this.height *= ky
        return this
    }

    /**
     * @param k scale factor
     * @returns a copy of this rect scaled by the given factor
     */
    scaled(k: {kx: number, ky: number} | number): Rect {
        return this.copy().scale(k)
    }
}
