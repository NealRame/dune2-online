import { cssHex } from "./color"
import { Brush, Painter } from "./painter"
import { ScaleFactor, SceneItem } from "./types"

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

export class Scene implements SceneItem {
    private painter_: Painter | null
    private backgroundColor_: Brush
    private gridEnabled_: boolean
    private items_: Array<SceneItem>
    private scaleFactor_: ScaleFactor

    constructor(painter: Painter | null = null) {
        this.painter_ = painter
        this.items_ = []
        this.backgroundColor_ = cssHex([0, 0, 0])
        this.scaleFactor_ = 1
        this.gridEnabled_ = true
    }

    get x(): number {
        return 0
    }

    get y(): number {
        return 0
    }

    get width(): number {
        return 0
    }

    get height(): number {
        return 0
    }

    setScale(scale: ScaleFactor): Scene {
        this.scaleFactor_ = scale
        return this
    }

    getScale(): ScaleFactor {
        return this.scaleFactor_
    }

    getParent(): null {
        return null
    }

    setParent(): Scene {
        return this
    }

    setPainter(painter: Painter | null = null): Scene {
        this.painter_ = painter
        return this
    }

    addItem(item: SceneItem): Scene {
        item.setParent(this)
        this.items_.push(item)
        return this
    }

    clear(): Scene {
        this.items_ = []
        return this
    }

    render(painter: Painter): Scene {
        painter.clear(this.backgroundColor_)
        // draw grid
        if (this.gridEnabled_ === true) {
            drawGrid(painter, {
                space: this.scaleFactor_*16,
            })
        }
        // draw items
        for (const item of this.items_) {
            item.render(painter)
        }

        return this
    }

    run(): Scene {
        const loop = () => {
            if (!isNil(this.painter_)) {
                this.render(this.painter_)
                requestAnimationFrame(loop)
            }
        }
        loop()
        return this
    }
}
