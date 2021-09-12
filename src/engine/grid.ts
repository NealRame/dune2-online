import { IScene, ISceneItem, ISceneLayer } from "./scene"

import { Color, Painter } from "@/graphics"
import { Rect, ISize, Vector } from "@/maths"

export interface GridConfig {
    space?: number,
    color?: Color.RGBA,
}

export interface Grid extends ISceneLayer {
    space: number,
    color: Color.RGBA,
}

export function createGrid(
    scene: IScene,
    config?: GridConfig,
): Grid {
    const state: Required<GridConfig> = {
        space: config?.space ?? scene.gridSpacing,
        color: config?.color ?? Color.rgb(34, 34, 34),
    }
    return {
        get name(): string {
            return "grid"
        },
        get scene(): IScene {
            return scene
        },
        get position(): Vector {
            return Vector.Null
        },
        get width(): number {
            return scene.width
        },
        get height(): number {
            return scene.height
        },
        get size(): ISize {
            return scene.size
        },
        get rect(): Rect {
            return scene.rect
        },
        get space(): number {
            return state.space
        },
        set space(space: number) {
            state.space = space
        },
        get color(): Color.RGBA {
            return state.color
        },
        set color(color: Color.RGBA) {
            state.color = color
        },
        addItem(): Grid {
            return this
        },
        * items(): Generator<ISceneItem, void, undefined> {
            yield * []
        },
        render(painter: Painter): Grid {
            const { width, height } = painter.size
            const offset = scene.viewport.rect.topLeft()

            painter.pen = {
                lineWidth: 1,
                strokeStyle: Color.cssRGBA(state.color),
            }

            // Draw vertical grid lines
            for (let x = 0.5 + offset.x%state.space; x < width; x += state.space) {
                painter.drawLine(
                    { x, y: 0 },
                    { x, y: height }
                )
            }

            // Draw horizontal grid lines
            for (let y = 0.5 + offset.y%state.space; y < height; y += state.space) {
                painter.drawLine(
                    { y, x: 0 },
                    { y, x: width }
                )
            }

            return this
        },
        update(): Grid {
            return this
        }
    }
}
