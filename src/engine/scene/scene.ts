import { SceneLayerImpl } from "./layer"
import { IScene, ISceneLayer } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { scaleDown, ScaleFactor, scaleUp } from "@/engine/scale"
import { createViewport, IViewport } from "@/engine/viewport"

import { Rect, IVector2D, ISize, Vector } from "@/maths"

import { isNil, matches } from "lodash"

type SceneState = {
    backgroundColor: Brush
    gridUnit: 16
    layers: ISceneLayer[]
    rect: Rect
    scaleFactor: ScaleFactor
    viewport: IViewport
}

export class SceneExistingLayer extends Error {
    private name_: string

    constructor(name: string) {
        super(`Layer '${name}' already exist`)
        this.name_ = name

        // restore prototype chain
        Object.setPrototypeOf(this, new.target.prototype)
    }

    get name(): string {
        return this.name_
    }
}

export function createScene(size: ISize, painter: Painter): IScene {
    const state: SceneState = {
        backgroundColor: cssHex([0, 0, 0]),
        gridUnit: 16,
        layers: [],
        scaleFactor: 1,
        rect: new Rect({ x: 0, y: 0 }, size),
        viewport: createViewport(size),
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
        get width(): number {
            return state.rect.width
        },
        get height(): number {
            return state.rect.height
        },
        get size(): ISize {
            return state.rect.size
        },
        get rect(): Rect {
            return state.rect.copy()
        },
        get viewport(): IViewport {
            return state.viewport
        },
        addLayer(layer: string|ISceneLayer): ISceneLayer {
            if (typeof layer === "string") {
                layer = new SceneLayerImpl(this, layer)
            }

            const { name } = layer
            if (state.layers.some(matches({ name }))) {
                throw new SceneExistingLayer(layer.name)
            }

            state.layers.push(layer)

            return layer
        },
        getLayer(layer: string|number): ISceneLayer|null {
            if (typeof layer === "string") {
                return state.layers.find(matches({ name: layer })) ?? null
            } else {
                return state.layers[layer] ?? null
            }
        },
        clear(): IScene {
            state.layers = []
            return this
        },
        render(): IScene {
            if (!isNil(painter)) {
                painter.clear(state.backgroundColor)
                // draw items
                for (const layer of state.layers) {
                    layer.render(painter)
                }
            }

            return this
        },
        update(): IScene {
            for (const layer of state.layers) {
                layer.update()
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
