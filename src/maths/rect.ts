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
            && y >= this.bottomY && y <= this.topY
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
     * @param rect
     * @returns true if and only if the given Rect intersect this Rect
     */
    intersects(rect: Rect): boolean {
        return this.contains(rect.topRight())
            || this.contains(rect.bottomRight())
            || this.contains(rect.bottomLeft())
            || this.contains(rect.topLeft())
    }

    /**
     * @param rect
     * @returns the result of the intersection of this Rect and the given one
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
