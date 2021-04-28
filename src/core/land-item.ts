import { Tile } from "./types"
import { Painter, ScaleFactor, SceneItem } from "@/graphics"
import { RectangularCoordinates } from "@/maths"

type LandItemState = {
    parent: SceneItem | null,
    x: number,
    y: number,
}

export function LandItem(
    tile: Tile,
    { x, y }: RectangularCoordinates,
): SceneItem {
    const state: LandItemState = {
        x,
        y,
        parent: null,
    }
    const currentScale = () => state.parent?.getScale() ?? 1
    const currentImage = () => tile[currentScale()]

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
            return currentImage().width
        },
        get height() {
            return currentImage().height
        },
        getScale(): ScaleFactor {
            return currentScale()
        },
        getParent(): SceneItem | null {
            return state.parent
        },
        setParent(parent: SceneItem | null): SceneItem {
            state.parent = parent
            return this
        },
        render(painter: Painter) {
            painter.drawImageBitmap(currentImage(), state)
            return this
        }
    }
}
