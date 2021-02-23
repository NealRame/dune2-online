import Vector from "./vector"

import is_number from "lodash/isNumber"
import clamp from "lodash/clamp"

export default function Rect({x, y}, {width, height}) {
    const bottomLeft  = Vector({x,  y: y + height})
    const bottomRight = Vector({x: x + width, y: y + height})
    const center      = Vector({x: x + width/2, y: y + height/2})
    const topLeft     = Vector({x, y})
    const topRight    = Vector({x: x + width, y: y})

    return {
        get x() { return x },
        get y() { return y },
        get width() { return width },
        get height() { return height },
        get leftX() { return x },
        get rightX() { return topRight.x },
        get topY() { return y },
        get bottomY() { return bottomLeft.y },
        get topLeft() { return topLeft },
        get topRight() { return topRight },
        get bottomLeft() { return bottomLeft },
        get bottomRight() { return bottomRight },
        get center() { return center },
        get size() {
            return {
                width,
                height,
            }
        },
        contains({x, y}) {
            return x >= bottomLeft.x  && y <= bottomLeft.y
                && x >= topLeft.x     && y >= topLeft.y
                && x <= topRight.x    && y >= topRight.y
                && x <= bottomRight.x && y <= bottomRight.y
        },
        intersected(rect) {
            return Rect({
                x: clamp(rect.x, 0, x),
                y: clamp(rect.y, 0, y),
            }, {
                width: clamp(width - rect.x, 0, rect.width),
                height: clamp(height - rect.y, 0, rect.height),
            })
        },
        cropped({width: max_width, height: max_height}) {
            return Rect({x, y}, {
                width: clamp(width, 0, max_width),
                height: clamp(height, 0, max_height),
            })
        },
        intersects(rect) {
            return this.contains(rect.topRight)
                || this.contains(rect.bottomRight)
                || this.contains(rect.bottomLeft)
                || this.contains(rect.topLeft)
        },
        translate({x, y}) {
            return Rect(topLeft.add({x, y}), {width, height})
        },
        scale(f) {
            const {x, y} = is_number(f) ? {x: f, y: f} : f
            return Rect(topLeft, {width: width*x, height: height*y})
        }
    }
}