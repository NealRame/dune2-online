import { SceneLayerImpl } from "./scene-layer"
import { ScaleFactor, Scene, SceneLayer } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

type SceneState = {
    backgroundColor: Brush
    gridEnabled: boolean
    gridUnit: 16
    layers: SceneLayer[]
    rect: Rect
    scaleFactor: ScaleFactor
    viewport: Rect | null

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

export function createScene(size: Size): Scene {
    const state: SceneState = {
        backgroundColor: cssHex([0, 0, 0]),
        gridEnabled: false,
        gridUnit: 16,
        layers: [],
        scaleFactor: 1,
        rect: new Rect({ x: 0, y: 0 }, size),
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
        get size(): Size {
            return state.rect.size
        },
        set size(size: Size) {
            state.rect = new Rect({ x: 0, y: 0 }, size)
        },
        get rect(): Rect {
            return state.rect.copy()
        },
        get viewport(): Rect {
            return (state.viewport ?? state.rect).copy()
        },
        set viewport(rect: Rect | null) {
            state.viewport = rect
        },
        addLayer(name: string): SceneLayer {
            const layer = new SceneLayerImpl(this, name)
            state.layers.push(layer)
            return layer
        },
        clear(): Scene {
            state.layers = []
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
            for (const layer of state.layers) {
                layer.render(painter)
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
            for (const layer of state.layers) {
                layer.update()
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
