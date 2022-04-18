import { Painter } from "./painter"

import {
    type IRect2D,
    type ISize2D,
    type IVector2D,
} from "@/maths"

import { IObservable } from "@/utils"

export type ScreenMouseMotionEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    movement: IVector2D,
    position: IVector2D,
}

export type ScreenMouseClickEvent = {
    button: boolean,
    altKey: boolean,
    ctrlKey: boolean,
    metaKey: boolean,
    position: IVector2D,
}

export interface IPaintDeviceEvents {
    resized: ISize2D
    mouseClicked: ScreenMouseClickEvent
    mouseMoved: ScreenMouseMotionEvent
}

export interface IPaintDevice {
    readonly events: IObservable<IPaintDeviceEvents>
    readonly painter: Painter,
    readonly width: number,
    readonly height: number,
    readonly rect: IRect2D,
    readonly size: ISize2D,
}
