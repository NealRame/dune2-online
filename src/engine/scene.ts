import { SceneLayerImpl } from "./scene-layer"
import { ScaleFactor, Scene, SceneLayer, Viewport } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"
import { createViewport } from "./viewport"
import { isNil } from "lodash"

type SceneState = {
    backgroundColor: Brush
    gridEnabled: boolean
    gridUnit: 16
    layers: SceneLayer[]
    rect: Rect
    scaleFactor: ScaleFactor
    viewport: Viewport
    requestAnimationId: number
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

export function createScene(size: Size, painter: Painter): Scene {
    const state: SceneState = {
        backgroundColor: cssHex([0, 0, 0]),
        gridEnabled: false,
        gridUnit: 16,
        layers: [],
        scaleFactor: 1,
        rect: new Rect({ x: 0, y: 0 }, size),
        viewport: createViewport(size),
        requestAnimationId: 0
    }

    const getGridSpacing = () => state.scaleFactor*state.gridUnit
    const updateViewport = () => {
        state.viewport.size = painter.rect.scaled(1/getGridSpacing()).size
    }

    updateViewport()

    return {
        get scale(): ScaleFactor {
            return state.scaleFactor
        },
        set scale(f: ScaleFactor) {
            state.scaleFactor = f
            updateViewport()
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
        get width(): number {
            return state.rect.width
        },
        get height(): number {
            return state.rect.height
        },
        get size(): Size {
            return state.rect.size
        },
        get rect(): Rect {
            return state.rect.copy()
        },
        get viewport(): Viewport {
            return state.viewport
        },
        addLayer(layer: string|SceneLayer): SceneLayer {
            if (typeof layer === "string") {
                layer = new SceneLayerImpl(this, layer)
            }
            state.layers.push(layer)
            return layer
        },
        clear(): Scene {
            state.layers = []
            return this
        },
        render(): Scene {
            if (!isNil(painter)) {
                const gridSpacing = getGridSpacing()
                const viewport = state.viewport.rect

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
            }

            return this
        },
        update(): Scene {
            for (const layer of state.layers) {
                layer.update()
            }
            return this
        },
        run(): Scene {
            const loop = () => {
                this.update()
                    .render()
                state.requestAnimationId = requestAnimationFrame(loop)
            }
            loop()
            return this
        },
        stop(): Scene {
            cancelAnimationFrame(state.requestAnimationId)
            state.requestAnimationId = 0
            return this
        }
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
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return (new Vector(x, y)).sub(topLeft).mul(gridSpacing)
}

export function screenToSceneCoordinate(
    scene: Scene,
    { x, y }: RectangularCoordinates
): Vector {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
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
    const { gridSpacing } = scene
    return {
        width: size.width/gridSpacing,
        height: size.height/gridSpacing,
    }
}

export function sceneToScreenRect(scene: Scene, rect: Rect)
    : Rect {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return rect.translated(topLeft.opposite).scale(gridSpacing)
}

export function screenToSceneRect(scene: Scene, rect: Rect)
    : Rect {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return rect.scale(1/gridSpacing).translated(topLeft)
}
