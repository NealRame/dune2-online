import { Tile } from "./types"
import { Painter, ScaleFactor, SceneItem } from "@/graphics"

export function LandItem(tile: Tile): SceneItem {
    const state = {
        x: 0,
        y: 0,
        scale: 1,
    }
    const image = () => tile[state.scale as ScaleFactor]
    return {
        get x() {
            return state.x
        },
        set x(x: number) {
            state.x = x
        },
        get y() {
            return state.y
        },
        set y(y: number) {
            state.y = y
        },
        get width() {
            return image().width
        },
        get height() {
            return image().height
        },
        get scale(): ScaleFactor {
            return state.scale as ScaleFactor
        },
        set scale(scale: ScaleFactor) {
            state.scale = scale
        },
        draw(painter: Painter) {
            painter.drawImageBitmap(image(), state)
            return this
        }
    }
}
