import { isNil } from "lodash"

import {
    type Token,
} from "@/engine/injector"

import {
    type GameResource,
    type IGameResourceDescriptor,
} from "./types"

export function define<T extends GameResource>(
    id: Token<T>,
    rcDescriptor: IGameResourceDescriptor<T>): void {
    Reflect.defineProperty(window, id as symbol, {
        value: rcDescriptor,
    })
}

export function getMetadata(id: Token<GameResource>)
    : IGameResourceDescriptor<GameResource> {
    const rcDescriptor = Reflect.get(window, id as symbol)
    if (isNil(rcDescriptor)) {
        throw new Error("No resource found!") // use a better exception
    }
    return rcDescriptor as unknown as IGameResourceDescriptor<GameResource>
}
