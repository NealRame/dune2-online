import { Rect, IVector2D, ISize } from "@/maths"
import { createObserver, Observer } from "@/utils"

import { clamp } from "lodash"

export interface IViewport {
    readonly onChanged: Observer<Rect>
    readonly rect: Rect
    position: IVector2D
    size: ISize
}

export function createViewport(sceneSize: ISize): IViewport {
    const observer = createObserver<Rect>()
    const rect = new Rect({ x: 0, y: 0 }, sceneSize)

    const setPosition = ({ x, y }: IVector2D) => {
        rect.x = clamp(x, 0, sceneSize.width - rect.width)
        rect.y = clamp(y, 0, sceneSize.height - rect.height)
        observer.publish(rect.copy())
    }

    const setSize = (size: ISize) => {
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
        get position(): IVector2D {
            return rect.topLeft()
        },
        set position(pos: IVector2D) {
            setPosition(pos)
        },
        get size(): ISize {
            return rect.size
        },
        set size(size: ISize) {
            setSize(size)
        },
    }
}
