import {
    type IScene,
} from "./scene"

import {
    type IPaintDevice,
} from "@/graphics"

import {
    Rect,
    type IVector2D,
    type ISize2D,
} from "@/maths"

import {
    createObservable,
    type IEmitter,
    type IObservable,
} from "@/utils"

import { clamp, isNil } from "lodash"

export interface IViewportEvent {
    changed: Rect
}

export interface IViewport {
    readonly events: IObservable<IViewportEvent>
    readonly rect: Rect
    position: IVector2D
    size: ISize2D
}

type ResizeEventHandler = (size: ISize2D) => void
type PositionEventHandler = (position: IVector2D) => void

export class Viewport implements IViewport {
    private emitter_: IEmitter<IViewportEvent>
    private events_: IObservable<IViewportEvent>
    private rect_: Rect
    private screen_: IPaintDevice | null = null

    private updateSize_: ResizeEventHandler
    private updatePosition_: PositionEventHandler

    constructor(
        private scene_: IScene,
    ) {
        const [emitter, events] = createObservable<IViewportEvent>()

        this.emitter_ = emitter
        this.events_ = events
        this.rect_ = Rect.empty()

        this.updateSize_ = ({ width, height }) => {
            const { gridSpacing, width: sceneW, height: sceneH } = this.scene_
            this.rect_.width = clamp(width/gridSpacing, 0, sceneW)
            this.rect_.height = clamp(height/gridSpacing, 0, sceneH)
            this.emitter_.emit("changed", Rect.fromRect(this.rect_))
        }

        this.updatePosition_ = ({ x, y }) => {
            this.rect_.x = clamp(x, 0, this.scene_.width - this.rect_.width)
            this.rect_.y = clamp(y, 0, this.scene_.height - this.rect_.height)
            this.emitter_.emit("changed", Rect.fromRect(this.rect_))
        }

        this.scene_.events
            .on("scaledChanged", () => {
                this.updateSize_(this.screen_?.size ?? { width: 0, height: 0 })
            })
            .on("sizeChanged", () => {
                this.updateSize_(this.screen_?.size ?? { width: 0, height: 0 })
            })
            .on("screenChanged", (screen: IPaintDevice | null) => {
                if (!isNil(this.screen_)) {
                    this.screen_.events.off("resized", this.updateSize_)
                }
                if (!isNil(screen)) {
                    this.screen_ = screen
                    this.updateSize_(this.screen_.size)
                    this.screen_.events.on("resized", this.updateSize_)
                }
            })
    }

    get events(): IObservable<IViewportEvent> {
        return this.events_
    }

    get rect(): Rect {
        return this.rect_
    }

    get position(): IVector2D {
        return this.rect_.topLeft()
    }

    set position(pos: IVector2D) {
        this.updatePosition_(pos)
    }

    get size(): ISize2D {
        return this.rect_.size
    }
}
