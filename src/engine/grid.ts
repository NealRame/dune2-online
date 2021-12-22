import { SceneItem } from "./scene"

import { Color, Painter } from "@/graphics"
import { Rect } from "@/maths"

export class Grid extends SceneItem {
    color: Color.RGBA = Color.rgb(34, 34, 34)

    render(painter: Painter, viewport: Rect): Grid {
        const { width, height } = painter.size
        const offset = viewport.topLeft()
        const gridSpace = this.scene.gridSpacing

        painter.pen = {
            lineWidth: 1,
            strokeStyle: Color.cssRGBA(this.color),
        }

        // Draw vertical grid lines
        for (let x = 0.5 + offset.x%gridSpace; x < width; x += gridSpace) {
            painter.drawLine(
                { x, y: 0 },
                { x, y: height }
            )
        }

        // Draw horizontal grid lines
        for (let y = 0.5 + offset.y%gridSpace; y < height; y += gridSpace) {
            painter.drawLine(
                { y, x: 0 },
                { y, x: width }
            )
        }

        return this
    }
}
