export default function Vector({x, y}) {
    return {
        get x() { return x },
        get y() { return y },
        set x(x_) { x = x_ },
        set y(y_) { y = y_ },
        get norm() {
            return Math.sqrt(x*x + y*y)
        },
        get opposite() {
            return Vector({x: -x, y: -y})
        },
        mutAdd({x: x_, y: y_}) {
            x += x_
            y += y_
            return this
        },
        add({x: x_, y: y_}) {
            return Vector({x: x + x_, y: y + y_})
        },
        mutSub({x: x_, y: y_}) {
            x -= x_
            y -= y_
            return this
        },
        sub({x: x_, y: y_}) {
            return Vector({x: x - x_, y: y - y_})
        },
        mutMul(k) {
            x *= k
            y *= k
            return this
        },
        mul(k) {
            return Vector({x: k*x, y: k*y})
        },
        mutTransform({m11, m12, m21, m22}) {
            x = x*m11 + y*m12
            y = x*m21 + y*m22
            return this
        },
        transform({m11, m12, m21, m22}) {
            return Vector({
                x: x*m11 + y*m12,
                y: x*m21 + y*m22,
            })
        },
        scalar({x: x_, y: y_}) {
            return x*x_ + y*y_
        },
        distance({x: x_, y: y_}) {
            return Math.sqrt((x - x_)*(x - x_) + (y - y_)*(y - y_))
        },
        equal({x: x_, y: y_}) {
            return x === x_
                && y === y_
        },
        isNull() {
            return x === 0
                && y === 0
        },
        toUnit() {
            return this.mul(1/this.norm)
        },
        toString() {
            return `(${x},${y})`
        }
    }
}

Vector.Null  = Vector({x:  0, y:  0})
Vector.Up    = Vector({x:  0, y: -1})
Vector.Right = Vector({x:  1, y:  0})
Vector.Down  = Vector({x:  0, y:  1})
Vector.Left  = Vector({x: -1, y:  0})
