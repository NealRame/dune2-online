import { Rect, RectangularCoordinates, Size } from "@/maths"
import { createObserver, Observer } from "@/utils"

import { clamp } from "lodash"

export interface Viewport {
    readonly onChanged: Observer<Rect>
    readonly rect: Rect
    position: RectangularCoordinates
    size: Size
}

export function createViewport(sceneSize: Size): Viewport {
    const observer = createObserver<Rect>()
    const rect = new Rect({ x: 0, y: 0 }, sceneSize)

    const setPosition = ({ x, y }: RectangularCoordinates) => {
        rect.x = clamp(x, 0, sceneSize.width - rect.width)
        rect.y = clamp(y, 0, sceneSize.height - rect.height)
        observer.publish(rect.copy())
    }

    const setSize = (size: Size) => {
        rect.width = clamp(size.width, 0, sceneSize.width)
        rect.height = clamp(size.height, 0, sceneSize.height)
        setPosition(rect.topLeft())
    }

    return {
        get onChanged(): Observer<Rect> {
            return observer
        },
        get rect(): Rect {
            return rect.copy()
        },
        get position(): RectangularCoordinates {
            return rect.topLeft()
        },
        set position(pos: RectangularCoordinates) {
            setPosition(pos)
        },
        get size(): Size {
            return rect.size
        },
        set size(size: Size) {
            setSize(size)
        },
    }
}
