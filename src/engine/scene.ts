import { ScaleFactor, Scene, SceneItem } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

type SceneState = {
    backgroundColor: Brush
    gridEnabled: boolean
    gridUnit: 16,
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
        gridUnit: 16,
        items: [],
        scaleFactor: 1,
        viewport: null,
    }

    const getGridSpacing = () => state.scaleFactor*state.gridUnit

    return {
        get scale(): ScaleFactor {
            return state.scaleFactor
        },
        set scale(f: ScaleFactor) {
            state.scaleFactor = f
        },
        get gridUnit(): number {
            return state.gridUnit
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
            return r
        },
        addItem(item: SceneItem): Scene {
            state.items.push(item)
            return this
        },
        clear(): Scene {
            state.items = []
            return this
        },
        render(painter: Painter): Scene {
            const gridSpacing = getGridSpacing()
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
                    item.render(painter, viewport)
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
        },
        update(): Scene {
            for (const item of state.items) {
                item.update()
            }
            return this
        },
    }
}

export function screenToSceneScale(
    scene: Scene,
    { x, y }: RectangularCoordinates
): Vector {
    return (new Vector(x, y)).mul(1/scene.gridSpacing)
}

export function sceneToScreenScale(
    scene: Scene,
    { x, y }: RectangularCoordinates
): Vector {
    return (new Vector(x, y)).mul(scene.gridSpacing)
}

export function sceneToScreenCoordinate(
    scene: Scene,
    { x, y }: RectangularCoordinates
): Vector {
    const { viewport, gridSpacing } = scene
    const topLeft = viewport?.topLeft() ?? Vector.Null()
    return (new Vector(x, y)).sub(topLeft).mul(gridSpacing)
}

export function screenToSceneCoordinate(
    scene: Scene,
    { x, y }: RectangularCoordinates
): Vector {
    const { viewport, gridSpacing } = scene
    const topLeft = viewport?.topLeft() ?? Vector.Null()
    return (new Vector(x, y)).mul(1/gridSpacing).add(topLeft)
}

export function sceneToScreenSize(scene: Scene, size: Size)
    : Size {
    const gridSpacing = scene.gridSpacing
    return {
        width: size.width*gridSpacing,
        height: size.height*gridSpacing,
    }
}

export function screenToSceneSize(scene: Scene, size: Size)
    : Size {
    const gridSpacing = scene.gridSpacing
    return {
        width: size.width/gridSpacing,
        height: size.height/gridSpacing,
    }
}

export function sceneToScreenRect(scene: Scene, rect: Rect)
    : Rect {
    const { viewport, gridSpacing } = scene
    const topLeft = viewport?.topLeft() ?? Vector.Null()
    return rect.translated(topLeft.opposite).scale(gridSpacing)
}

export function screenToSceneRect(scene: Scene, rect: Rect)
    : Rect {
    const { viewport, gridSpacing } = scene
    const topLeft = viewport?.topLeft() ?? Vector.Null()
    return rect.scale(1/gridSpacing).translated(topLeft)
}

export abstract class AbstractSceneItem implements SceneItem {
    private scene_: Scene
    protected width_ = 0
    protected height_ = 0
    x = 0
    y = 0

    constructor(scene: Scene) {
        this.scene_ = scene
    }

    get scene(): Scene {
        return this.scene_
    }

    get position(): Vector {
        return new Vector(this.x, this.y)
    }

    set position({ x, y }: RectangularCoordinates) {
        this.x = x
        this.y = y
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
    }

    get size(): Size {
        return {
            width: this.width_,
            height: this.height_,
        }
    }

    get rect(): Rect {
        return new Rect(this.position, this.size)
    }

    abstract render(painter: Painter, viewport: Rect): SceneItem

    update(): AbstractSceneItem {
        return this
    }
}
