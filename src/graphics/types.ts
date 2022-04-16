import { Painter } from "./painter"

import {
    type IVector2D,
    type ISize2D,
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
}
