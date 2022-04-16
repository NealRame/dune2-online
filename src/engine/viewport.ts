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

import { clamp } from "lodash"

export interface IViewportEvent {
    changed: Rect
}

export interface IViewport {
    readonly events: IObservable<IViewportEvent>
    readonly rect: Rect
    position: IVector2D
    size: ISize2D
}

export class Viewport implements IViewport {
    private emitter_: IEmitter<IViewportEvent>
    private events_: IObservable<IViewportEvent>
    private rect_: Rect

    private setSize_({ width, height }: ISize2D) {
        this.rect_.width = clamp(width/this.scene_.gridSpacing, 0, this.scene_.width)
        this.rect_.height = clamp(height/this.scene_.gridSpacing, 0, this.scene_.height)
        this.emitter_.emit("changed", Rect.fromRect(this.rect_))
    }

    private setPosition_({ x, y }: IVector2D) {
        this.rect_.x = clamp(x, 0, this.scene_.width - this.rect_.width)
        this.rect_.y = clamp(y, 0, this.scene_.height - this.rect_.height)
        this.emitter_.emit("changed", Rect.fromRect(this.rect_))
    }

    constructor(
        private scene_: IScene,
        private screen_: IPaintDevice,
    ) {
        const [emitter, events] = createObservable<IViewportEvent>()

        this.emitter_ = emitter
        this.events_ = events

        this.rect_ = new Rect({ x: 0, y: 0 }, {
            width: this.screen_.painter.width/this.scene_.gridSpacing,
            height: this.screen_.painter.height/this.scene_.gridSpacing,
        })

        this.scene_.events.on("scaledChanged", () => {
            this.setSize_(this.screen_.painter.size)
        })
        this.screen_.events.on("resized", size => {
            this.setSize_(size)
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
        this.setPosition_(pos)
    }

    get size(): ISize2D {
        return this.rect_.size
    }
}
