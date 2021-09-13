import { IScene } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { scaleDown, ScaleFactor, scaleUp } from "@/engine/scale"
import { createViewport, IViewport } from "@/engine/viewport"

import { Rect, IVector2D, ISize, Vector } from "@/maths"

import { isNil } from "lodash"
import { ISceneItem } from "."

type SceneState = {
    backgroundColor: Brush
    gridUnit: 16
    items: ISceneItem[]
    scaleFactor: ScaleFactor
    width: number
    height: number
    viewport: IViewport
    visible: boolean
}

export function createScene(size: ISize, painter: Painter): IScene {
    const state: SceneState = {
        backgroundColor: cssHex([0, 0, 0]),
        gridUnit: 16,
        items: [],
        scaleFactor: 1,
        width: size.width,
        height: size.height,
        viewport: createViewport(size),
        visible: true,
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
            if (state.scaleFactor !== f) {
                state.scaleFactor = f
                updateViewport()
            }
        },
        get gridUnit(): number {
            return state.gridUnit
        },
        get gridSpacing(): number {
            return getGridSpacing()
        },
        get position(): Vector {
            return Vector.Null
        },
        get width(): number {
            return state.width
        },
        get height(): number {
            return state.height
        },
        get size(): ISize {
            return {
                width: state.width,
                height: state.height
            }
        },
        get rect(): Rect {
            return new Rect({ x: 0, y: 0 }, this.size)
        },
        get viewport(): IViewport {
            return state.viewport
        },
        get scene(): IScene {
            return this
        },
        get visible(): boolean {
            return state.visible
        },
        set visible(visible: boolean) {
            state.visible = visible
        },
        get name(): string {
            return ""
        },
        addItem(item: ISceneItem): IScene {
            state.items.push(item)
            return this
        },
        * items() {
            for (const item of state.items) {
                yield item
            }
        },
        clear(): IScene {
            state.items = []
            return this
        },
        render(): IScene {
            if (!isNil(painter)) {
                painter.clear(state.backgroundColor)
                if (state.visible) {
                    // draw items
                    for (const item of state.items) {
                        if (item.visible) {
                            item.render(painter, state.viewport.rect)
                        }
                    }
                }
            }
            return this
        },
        update(): IScene {
            for (const item of state.items) {
                item.update()
            }
            return this
        },
        zoomIn(): IScene {
            this.scale = scaleUp(this.scale)
            return this
        },
        zoomOut(): IScene {
            this.scale = scaleDown(this.scale)
            return this
        }
    }
}

export function screenToSceneScale(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    return (new Vector(x, y)).mul(1/scene.gridSpacing)
}

export function sceneToScreenScale(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    return (new Vector(x, y)).mul(scene.gridSpacing)
}

export function sceneToScreenCoordinate(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return (new Vector(x, y)).sub(topLeft).mul(gridSpacing)
}

export function screenToSceneCoordinate(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return (new Vector(x, y)).mul(1/gridSpacing).add(topLeft)
}

export function sceneToScreenSize(scene: IScene, size: ISize)
    : ISize {
    const gridSpacing = scene.gridSpacing
    return {
        width: size.width*gridSpacing,
        height: size.height*gridSpacing,
    }
}

export function screenToSceneSize(scene: IScene, size: ISize)
    : ISize {
    const { gridSpacing } = scene
    return {
        width: size.width/gridSpacing,
        height: size.height/gridSpacing,
    }
}

export function sceneToScreenRect(scene: IScene, rect: Rect)
    : Rect {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return rect.translated(topLeft.opposite).scale(gridSpacing)
}

export function screenToSceneRect(scene: IScene, rect: Rect)
    : Rect {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return rect.scale(1/gridSpacing).translated(topLeft)
}
