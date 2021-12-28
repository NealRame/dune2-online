import { IRect2D, ISize2D, IVector2D, } from "./types"
import { Vector } from "./vector"

import { isNumber } from "lodash"

/**
 * @class Rect
 */
export class Rect implements IRect2D {
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
        { x, y }: IVector2D,
        { width, height }: ISize2D
    ) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    /**
     * @returns a copy of the given rectangle
     */
    static fromRect({ x, y, width, height }: IRect2D): Rect {
        return new Rect(
            { x, y },
            { width, height },
        )
    }

    /**
     * @returns the size to this Rect
     */
    get size(): ISize2D {
        return {
            width: this.width,
            height: this.height,
        }
    }

    /**
     * @returns the area of this Rect
     */
    get area(): number {
        return this.width*this.height
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
    contains({ x, y }: IVector2D): boolean {
        return x >= this.leftX && x <= this.rightX
            && y >= this.topY  && y <= this.bottomY
    }

    /**
     * Return true if and only if the given rectangle intersect this rectangle.
     * @param rect
     * @returns boolean
     */
    overlap(rect: Rect): boolean {
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
    intersected(rect: Rect): Rect|null {
        if (!this.overlap(rect)) {
            return null
        }

        const leftX = Math.max(this.leftX, rect.leftX)
        const rightX = Math.min(this.rightX, rect.rightX)
        const topY = Math.max(this.topY, rect.topY)
        const bottomY = Math.min(this.bottomY, rect.bottomY)

        return new Rect({
            x: leftX,
            y: topY,
        }, {
            width: rightX - leftX,
            height: bottomY - topY,
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
        return Rect.fromRect(this).union(rect)
    }

    /**
     * Crop this Rect to the given size.
     * @param size
     * @returns this
     */
    crop({ width, height }: ISize2D): Rect {
        this.width = width
        this.height = height
        return this
    }

    /**
     * @param size
     * @returns a copy of thie Rect that it is cropped to the given size
     */
    cropped({ width, height }: ISize2D): Rect {
        return Rect.fromRect(this).crop({ width, height })
    }

    /**
     * Translate this Rect by the given vector
     * @param vector
     * @returns this
     */
    translate({ x, y }: IVector2D) : Rect {
        this.x += x
        this.y += y
        return this
    }

    /**
     * @param vector
     * @returns a copy of this Rect that is translated using given vector
     */
    translated({ x, y }: IVector2D): Rect {
        return Rect.fromRect(this).translate({ x, y })
    }

    /**
     * Scale this rect by the given factor
     * @param k scale factor
     * @returns this
     */
    scale(k: {kx: number, ky: number} | number): Rect {
        const { kx, ky } = isNumber(k) ? { kx: k, ky: k } : k
        this.x *= kx
        this.y *= ky
        this.width *= kx
        this.height *= ky
        return this
    }

    /**
     * @param k scale factor
     * @returns a copy of this rect scaled by the given factor
     */
    scaled(k: {kx: number, ky: number} | number): Rect {
        return Rect.fromRect(this).scale(k)
    }

    * partition(chunk: ISize2D = { width: 1, height: 1 }): Generator<Rect> {
        for (let y = this.y; y < this.y + this.height; y += chunk.height) {
            for (let x = this.x; x < this.x + this.width; x += chunk.width) {
                const width = Math.min(chunk.width, this.width - x)
                const height = Math.min(chunk.height, this.height - y)
                yield new Rect({ x, y }, { width, height })
            }
        }
    }
}
