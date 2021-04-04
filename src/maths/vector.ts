import { RectangularCoordinates, Transform2DMatrix } from "./types"

export class Vector implements RectangularCoordinates {
    x: number
    y: number

    constructor({ x, y }: RectangularCoordinates) {
        this.x = x
        this.y = y
    }

    /**
     * The vector norm
     */
    get norm(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    /**
     * The opposite of this Vector
     */
    get opposite(): Vector {
        return new Vector({
            x: -this.x,
            y: -this.y
        })
    }

    /**
     * Add the given Vector like object
     * @returns this
     */
    add({ x, y }: RectangularCoordinates): Vector {
        this.x += x
        this.y += y
        return this
    }

    /**
     * Sub the given Vector like object
     * @returns this
     */
    sub({ x, y }: RectangularCoordinates): Vector {
        this.x -= x
        this.y -= y
        return this
    }

    /**
     * Multiply by a given number
     * @returns this
     */
    mul(k: number): Vector {
        this.x *= k
        this.y *= k
        return this
    }

    /**
     * Transform with the given 2D transform matrix
     * @returns this
     */
    transform({ m11, m12, m21, m22 }: Transform2DMatrix): Vector {
        const { x, y } = this
        this.x = x*m11 + y*m12
        this.y = x*m21 + y*m22
        return this
    }

    /**
     * Scalar product with the Vector like object
     * @returns this
     */
    scalar({ x, y }: RectangularCoordinates): number {
        return this.x*x + this.y*y
    }

    /**
     * Distance to the givent Vector like object
     * @returns this
     */
    distance({ x, y }: RectangularCoordinates): number {
        x = this.x - x
        y = this.y - y
        return Math.sqrt(x*x + y*y)
    }

    /**
     * @returns true if the given Vector like object has same x and y values
     */
    equal({ x, y }: RectangularCoordinates): boolean {
        return this.x === x && this.y === y
    }

    /**
     * @returns true if x and y are zero
     */
    isNull(): boolean {
        return this.x === 0 && this.y === 0
    }

    /**
     * @returns returns the corresponding unit vector
     */
    toUnit(): Vector {
        const n = this.norm
        return new Vector({
            x: this.x/n,
            y: this.y/n,
        })
    }

    toString(): string {
        return `(${this.x}, ${this.y})`
    }

    static Null  = new Vector({ x:  0, y:  0 })
    static Up    = new Vector({ x:  0, y: -1 })
    static Right = new Vector({ x:  1, y:  0 })
    static Down  = new Vector({ x:  0, y:  1 })
    static Left  = new Vector({ x: -1, y:  0 })
}
