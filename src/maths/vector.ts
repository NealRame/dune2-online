import { Direction, IVector2D, ITransformMatrix2D } from "./types"

export class Vector implements IVector2D {
    constructor(
        public x: number,
        public y: number,
    ) { }

    static FromVector({ x, y }: IVector2D): Vector {
        return new Vector(x, y)
    }

    static FromDirection(direction: Direction): Vector {
        switch (direction) {
        case Direction.North:
            return Vector.Up

        case Direction.Northeast:
            return Vector.UpRight

        case Direction.East:
            return Vector.Right

        case Direction.Southeast:
            return Vector.DownRight

        case Direction.South:
            return Vector.Down

        case Direction.Southwest:
            return Vector.DownLeft

        case Direction.West:
            return Vector.Left

        case Direction.Northwest:
            return Vector.UpLeft
        }

        const exhaustiveCheck_: never = direction
        return exhaustiveCheck_
    }

    static get Zero(): Vector {
        return new Vector( 0,  0)
    }

    static get Up(): Vector {
        return new Vector( 0, -1)
    }

    static get Left(): Vector {
        return new Vector(-1,  0)
    }

    static get Down(): Vector {
        return new Vector( 0,  1)
    }

    static get Right(): Vector {
        return new Vector( 1,  0)
    }

    static get UpLeft(): Vector {
        return new Vector(-Math.sqrt(1), -Math.sqrt(1))
    }

    static get UpRight(): Vector {
        return new Vector( Math.sqrt(1), -Math.sqrt(1))
    }

    static get DownRight(): Vector {
        return new Vector( Math.sqrt(1),  Math.sqrt(1))
    }

    static get DownLeft(): Vector {
        return new Vector(-Math.sqrt(1),  Math.sqrt(1))
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
        return new Vector(-this.x, -this.y)
    }

    /**
     * Add the given Vector like object
     * @returns this
     */
    add({ x, y }: IVector2D): Vector {
        this.x += x
        this.y += y
        return this
    }

    /**
     * Sub the given Vector like object
     * @returns this
     */
    sub({ x, y }: IVector2D): Vector {
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
    transform({ m11, m12, m21, m22 }: ITransformMatrix2D): Vector {
        const { x, y } = this
        this.x = x*m11 + y*m12
        this.y = x*m21 + y*m22
        return this
    }

    /**
     * Dot product with the Vector like object
     * @returns this
     */
    dot({ x, y }: IVector2D): number {
        return this.x*x + this.y*y
    }

    /**
     * Distance to the givent Vector like object
     * @returns this
     */
    distance({ x, y }: IVector2D): number {
        x = this.x - x
        y = this.y - y
        return Math.sqrt(x*x + y*y)
    }

    /**
     * @returns true if the given Vector like object has same x and y values
     */
    equal({ x, y }: IVector2D): boolean {
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
        return new Vector(this.x/n, this.y/n)
    }

    toString(): string {
        return `(${this.x}, ${this.y})`
    }
}
