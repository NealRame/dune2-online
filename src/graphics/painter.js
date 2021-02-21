import is_number from "lodash/isNumber"
import is_string from "lodash/isString"

export default function Painter(paint_device) {
    const state = {
        backgroundColor: paint_device.context.fillStyle,
        context: paint_device.context,
    }
    return {
        // Pen and brush
        getPen() {
            return {
                lineWidth: state.context.lineWidth,
                strokeStyle: state.context.strokeStyle,
            }
        },
        setPen(pen) {
            if (is_number(pen)) {
                state.context.lineWidth = pen
            } else if (is_string(pen)) {
                state.context.strokeStyle = pen
            } else {
                const {lineWidth, strokeStyle} = pen
                state.context.lineWidth = lineWidth
                state.context.strokeStyle = strokeStyle
            }
        },
        getBrush() {
            return state.context.fillStyle
        },
        setBrush(brush) {
            state.context.fillStyle = brush
        },
        // Drawing routines
        clear() {
            state.context.save()
            state.context.fillStyle = state.backgroundColor
            state.context.fillRect(0, 0, paint_device.width, paint_device.height)
            state.context.restore()
            return this
        },
        drawLine({x: x1, y: y1}, {x: x2, y: y2}) {
            state.context.beginPath()
            state.context.moveTo({x: x1, y: y1})
            state.context.lineTo({x: x2, y: y2})
            state.context.stroke()
            return this
        },
        drawRect({topLeft, topRight, bottomLeft, bottomRight}) {
            state.context.beginPath()
            state.context.moveTo(topLeft)
            state.context.lineTo(topRight)
            state.context.lineTo(bottomRight)
            state.context.lineTo(bottomLeft)
            state.context.closePath()
            state.context.stroke()
            return this
        },
        fillRect({topLeft, topRight, bottomLeft, bottomRight}) {
            state.context.beginPath()
            state.context.moveTo(topLeft)
            state.context.lineTo(topRight)
            state.context.lineTo(bottomRight)
            state.context.lineTo(bottomLeft)
            state.context.closePath()
            state.context.fill()
            return this
        },
    }
}