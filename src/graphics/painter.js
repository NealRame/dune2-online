import is_number from "lodash/isNumber"
import is_string from "lodash/isString"

export default function Painter(paint_device) {
    const context = paint_device.context
    return {
        // Pen and brush
        getPen() {
            return {
                lineWidth: context.lineWidth,
                strokeStyle: context.strokeStyle,
            }
        },
        setPen(pen) {
            if (is_number(pen)) {
                context.lineWidth = pen
            } else if (is_string(pen)) {
                context.strokeStyle = pen
            } else {
                const {lineWidth, strokeStyle} = pen
                context.lineWidth = lineWidth
                context.strokeStyle = strokeStyle
            }
        },
        getBrush() {
            return context.fillStyle
        },
        setBrush(brush) {
            context.fillStyle = brush
        },
        // Drawing routines
        clear(brush) {
            context.save()
            context.fillStyle = brush
            context.fillRect(0, 0, paint_device.width, paint_device.height)
            context.restore()
            return this
        },
        drawLine({x: x1, y: y1}, {x: x2, y: y2}) {
            context.beginPath()
            context.moveTo({x: x1, y: y1})
            context.lineTo({x: x2, y: y2})
            context.stroke()
            return this
        },
        drawRect({topLeft, topRight, bottomLeft, bottomRight}) {
            context.beginPath()
            context.moveTo(topLeft)
            context.lineTo(topRight)
            context.lineTo(bottomRight)
            context.lineTo(bottomLeft)
            context.closePath()
            context.stroke()
            return this
        },
        fillRect({topLeft, topRight, bottomLeft, bottomRight}) {
            context.beginPath()
            context.moveTo(topLeft)
            context.lineTo(topRight)
            context.lineTo(bottomRight)
            context.lineTo(bottomLeft)
            context.closePath()
            context.fill()
            return this
        },
    }
}