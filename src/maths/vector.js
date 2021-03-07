export default class Vector {
    constructor({x, y}) {
        this.x = x
        this.y = y
    }
    get norm() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }
    get opposite() {
        return new Vector({
            x: -this.x,
            y: -this.y
        })
    }
    add({x, y}) {
        this.x += x
        this.y += y
        return this
    }
    sub({x, y}) {
        this.x -= x
        this.y -= y
        return this
    }
    mul(k) {
        this.x *= k
        this.y *= k
        return this
    }
    transform({m11, m12, m21, m22}) {
        const {x, y} = this
        this.x = x*m11 + y*m12
        this.y = x*m21 + y*m22
        return this
    }
    scalar({x, y}) {
        return this.x*x + this.y*y
    }
    distance({x, y}) {
        x = this.x - x
        y = this.y - y
        return Math.sqrt(x*x + y*y)
    }
    equal({x, y}) {
        return this.x === x
            && this.y === y
    }
    isNull() {
        return this.x === 0
            && this.y === 0
    }
    toUnit() {
        const n = this.norm
        return new Vector({x: this.x/n, y: this.y/n})
    }
    toString() {
        return `(${this.x},${this.y})`
    }

    static Null  = new Vector({x:  0, y:  0})
    static Up    = new Vector({x:  0, y: -1})
    static Right = new Vector({x:  1, y:  0})
    static Down  = new Vector({x:  0, y:  1})
    static Left  = new Vector({x: -1, y:  0})
}
