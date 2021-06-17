import { ScaleFactor, Scene, SceneItem } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"
import { Rect, RectangularCoordinates } from "@/maths"

type SceneState = {
    backgroundColor: Brush
    gridEnabled: boolean
    scaleFactor: ScaleFactor
    viewport: Rect | null
    items: SceneItem[]
}

type GridConfig = {
    enabled?: boolean,
    offset?: RectangularCoordinates,
    space?: number,
    color?: string,
}

function drawGrid(
    painter: Painter, {
        space = 16,
        color = "#222",
        offset = { x: 0, y: 0 },
    }: GridConfig = { }
): void {
    const { width, height } = painter.size
    painter.pen = {
        lineWidth: 1,
        strokeStyle: color
    }
    // Draw vertical grid lines
    for (let x = 0.5 + offset.x%space; x < width; x += space) {
        painter.drawLine(
            { x, y: 0 },
            { x, y: height }
        )
    }
    // Draw horizontal grid lines
    for (let y = 0.5 + offset.y%space; y < height; y += space) {
        painter.drawLine(
            { y, x: 0 },
            { y, x: width }
        )
    }
}

export function createScene(): Scene {
    const state: SceneState = {
        backgroundColor: cssHex([0, 0, 0]),
        gridEnabled: false,
        items: [],
        scaleFactor: 1,
        viewport: null,
    }

    const getGridSpacing = () => state.scaleFactor*16

    return {
        get scale(): ScaleFactor {
            return state.scaleFactor
        },
        set scale(f: ScaleFactor) {
            state.scaleFactor = f
        },
        get gridSpacing(): number {
            return getGridSpacing()
        },
        get gridEnabled(): boolean {
            return state.gridEnabled
        },
        set gridEnabled(enabled: boolean) {
            state.gridEnabled = enabled
        },
        get viewport(): Rect | null {
            return state.viewport
        },
        set viewport(rect: Rect | null) {
            state.viewport = rect
        },
        get rect(): Rect {
            const r = new Rect({ x: 0, y: 0 }, { width: 0, height: 0 })
            for (const item of state.items) {
                r.union(item.rect)
            }
            return r.scale(this.scale)
        },
        addItem(item: SceneItem): Scene {
            state.items.push(item)
            return this
        },
        clear(): Scene {
            state.items = []
            return this
        },
        update(): Scene {
            for (const item of state.items) {
                item.update()
            }
            return this
        },
        render(painter: Painter): Scene {
            const gridSpacing = getGridSpacing()
            const scaleFactor = state.scaleFactor
            const viewport = state.viewport ?? painter.rect.scaled(1/gridSpacing)

            painter.clear(state.backgroundColor)

            // draw grid
            if (state.gridEnabled) {
                drawGrid(painter, {
                    space: gridSpacing,
                    offset: viewport.topLeft(),
                })
            }

            // draw items
            for (const item of state.items) {
                if (viewport.intersects(item.rect)) {
                    item.render(painter, gridSpacing, scaleFactor, viewport)
                }
            }

            return this
        },
        run(painter: Painter): Scene {
            const loop = () => {
                this.update()
                    .render(painter)
                requestAnimationFrame(loop)
            }
            loop()
            return this
        }
    }
}
