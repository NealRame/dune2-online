import { IScene, ISceneItem } from "./types"

import { cssHex } from "@/graphics/color"
import { Brush, Painter } from "@/graphics/painter"

import { Entity } from "@/engine/entity"
import { scaleDown, ScaleFactor, scaleUp } from "@/engine/scale"
import { createViewport, IViewport } from "@/engine/viewport"

import { Rect, IVector2D, ISize, Vector } from "@/maths"

import { isNil } from "lodash"

export class Scene extends Entity implements IScene {
    private backgroundColor_: Brush
    private gridUnit_ = 16
    private scale_: ScaleFactor
    private width_: number
    private height_: number
    private viewport_: IViewport
    private painter_: Painter
    private items_: Array<ISceneItem> = []

    visible = true

    private updateViewport_() {
        this.viewport_.size = this.painter_.rect.scaled(1/this.gridSpacing).size
    }

    constructor(size: ISize, painter: Painter) {
        super()
        this.backgroundColor_ = cssHex([0, 0, 0])
        this.width_ = size.width
        this.height_ = size.height
        this.scale_ = 3
        this.painter_ = painter
        this.viewport_ = createViewport(size)

        this.updateViewport_()
    }

    get scale(): ScaleFactor {
        return this.scale_
    }

    set scale(f: ScaleFactor) {
        if (this.scale_ !== f) {
            this.scale_ = f
            this.updateViewport_()
        }
    }

    get gridUnit(): number {
        return this.gridUnit_
    }

    get gridSpacing(): number {
        return this.scale_*this.gridUnit_
    }

    get position(): Vector {
        return Vector.Null
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

    get size(): ISize {
        return {
            width: this.width_,
            height: this.height_,
        }
    }

    get rect(): Rect {
        return new Rect({ x: 0, y: 0 }, this.size)
    }

    get viewport(): IViewport {
        return this.viewport_
    }

    get scene(): this {
        return this
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
        return this
    }

    render(): IScene {
        if (!isNil(this.painter_)) {
            this.painter_.clear(this.backgroundColor_)
            if (this.visible) {
                // draw items
                for (const item of this.items_) {
                    if (item.visible) {
                        item.render(this.painter_, this.viewport_.rect)
                    }
                }
            }
        }
        return this
    }

    update(): IScene {
        for (const item of this.items_) {
            item.update()
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
