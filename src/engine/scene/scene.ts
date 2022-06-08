import { IScene, ISceneEvents, ISceneItem } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush } from "@/graphics/painter"

import { scaleDown, ScaleFactor, scaleUp } from "@/engine/scale"
import {
    type IViewport,
    Viewport,
} from "@/engine/viewport"

import { Rect, IVector2D, ISize2D, Vector } from "@/maths"

import { isNil } from "lodash"
import { IPaintDevice } from "@/graphics"
import { createObservable, IEmitter, IObservable } from "@/utils"

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

export function sceneToScreenPosition(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return (new Vector(x, y)).sub(topLeft).mul(gridSpacing)
}

export function screenToScenePosition(
    scene: IScene,
    { x, y }: IVector2D
): Vector {
    const { gridSpacing, viewport } = scene
    const topLeft = viewport.rect.topLeft()
    return (new Vector(x, y)).mul(1/gridSpacing).add(topLeft)
}

export function sceneToScreenSize(scene: IScene, size: ISize2D)
    : ISize2D {
    const gridSpacing = scene.gridSpacing
    return {
        width: size.width*gridSpacing,
        height: size.height*gridSpacing,
    }
}

export function screenToSceneSize(scene: IScene, size: ISize2D)
    : ISize2D {
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

export class Scene implements IScene {
    private emitter_: IEmitter<ISceneEvents>
    private events_: IObservable<ISceneEvents>
    private backgroundColor_: Brush
    private scale_: ScaleFactor
    private width_: number
    private height_: number

    private gridUnit_ = 16
    private items_: Array<ISceneItem> = []
    private screen_: IPaintDevice | null = null
    private viewport_: Viewport

    visible = true

    constructor() {
        const [emitter, events] = createObservable<ISceneEvents>()

        this.emitter_ = emitter
        this.events_ = events

        this.backgroundColor_ = cssHex([0, 0, 0])
        this.width_ = 0
        this.height_ = 0
        this.scale_ = 3

        this.viewport_ = new Viewport(this)
    }

    get events(): IObservable<ISceneEvents> {
        return this.events_
    }

    get scale(): ScaleFactor {
        return this.scale_
    }

    set scale(f: ScaleFactor) {
        if (this.scale_ !== f) {
            this.scale_ = f
            this.emitter_.emit("scaledChanged", f)
        }
    }

    get gridUnit(): number {
        return this.gridUnit_
    }

    get gridSpacing(): number {
        return this.scale_*this.gridUnit_
    }

    get position(): Vector {
        return Vector.Zero
    }

    get x(): number {
        return 0
    }

    get y(): number {
        return 0
    }

    get width(): number {
        return this.width_
    }

    get height(): number {
        return this.height_
    }

    get size(): ISize2D {
        return {
            width: this.width_,
            height: this.height_,
        }
    }

    set size(size: ISize2D) {
        this.width_ = size.width
        this.height_ = size.height
        this.emitter_.emit("sizeChanged", size)
    }

    get rect(): Rect {
        return new Rect({ x: 0, y: 0 }, this.size)
    }

    get scene(): this {
        return this
    }

    get screen(): IPaintDevice | null {
        return this.screen_
    }

    set screen(screen: IPaintDevice | null) {
        this.screen_ = screen
        this.emitter_.emit("screenChanged", screen)
    }

    get viewport(): IViewport {
        return this.viewport_
    }

    addItem(item: ISceneItem): this {
        this.items_.push(item)
        return this
    }

    removeItem(item: ISceneItem): this {
        const index = this.items_.indexOf(item)
        if (index >= 0) {
            this.items_.splice(index, 1)
        }
        return this
    }

    * items(): Generator<ISceneItem, void, undefined> {
        for (const item of this.items_) {
            yield item
        }
    }

    clear(): this {
        this.items_ = []
        this.size = { width: 0, height: 0 }
        return this
    }

    render(): IScene {
        if (!isNil(this.screen_) && !isNil(this.viewport_)) {
            const painter = this.screen_.painter
            painter.clear(this.backgroundColor_)
            if (this.visible) {
                // draw items
                for (const item of this.items_) {
                    if (item.visible) {
                        item.render(painter, this.viewport_.rect)
                    }
                }
            }
        }
        return this
    }

    zoomIn(): IScene {
        this.scale = scaleUp(this.scale_)
        return this
    }

    zoomOut(): IScene {
        this.scale = scaleDown(this.scale)
        return this
    }
}
