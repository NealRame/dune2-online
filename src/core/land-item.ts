import { Tile } from "./types"
import { Painter, ScaleFactor, SceneItem, Surface } from "@/graphics"

function tileToSurface(tile: Tile): Record<ScaleFactor, Surface> {
    return Object.assign({}, ...[1, 2, 3, 4].map((scale) => ({
        [scale]: new Surface(tile[scale as ScaleFactor])
    })))
}

export function LandItem(tile: Tile): SceneItem {
    const state = {
        x: 0,
        y: 0,
        surfaces: tileToSurface(tile),
        scale: 1,
    }
    const currentSurface = () => state.surfaces[state.scale as ScaleFactor]
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
            return currentSurface().width
        },
        get height() {
            return currentSurface().height
        },
        get scale(): ScaleFactor {
            return state.scale as ScaleFactor
        },
        set scale(scale: ScaleFactor) {
            state.scale = scale
        },
        draw(painter: Painter) {
            painter.drawSurface(currentSurface(), state)
            return this
        }
    }
}
