import { cssHex } from "./color"
import { Brush, Painter } from "./painter"

import { isNil } from "lodash"

type GridConfig = {
    enabled?: boolean,
    space?: number,
    color?: string,
}

function drawGrid(
    painter: Painter, {
        space = 16,
        color = "#222",
    }: GridConfig = { }
): void {
    const { width, height } = painter.size
    painter.pen = {
        lineWidth: 1,
        strokeStyle: color
    }
    // Draw vertical grid lines
    for (let x = 0.5; x < width; x += space) {
        painter.drawLine(
            { x, y: 0 },
            { x, y: height }
        )
    }
    // Draw horizontal grid lines
    for (let y = 0.5; y < height; y += space) {
        painter.drawLine(
            { y, x: 0 },
            { y, x: width }
        )
    }
}

export class Scene {
    private painter_: Painter | null
    private backgroundColor_: Brush
    private gridConfig_: GridConfig

    constructor(painter: Painter | null = null) {
        this.painter_ = painter
        this.backgroundColor_ = cssHex([0, 0, 0])
        this.gridConfig_ = {
            enabled: true,
            space: 32
        }
    }

    setPainter(painter: Painter | null = null): Scene {
        this.painter_ = painter
        return this
    }

    render(): Scene {
        if (!isNil(this.painter_)) {
            this.painter_.clear(this.backgroundColor_)
            // draw grid
            if (this.gridConfig_.enabled) {
                drawGrid(this.painter_, this.gridConfig_)
            }
        }
        return this
    }

    run(): Scene {
        const loop = () => {
            this.render()
            requestAnimationFrame(loop)
        }
        loop()
        return this
    }
}
