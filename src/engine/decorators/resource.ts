import "reflect-metadata"

import { ResourceURIKey } from "@/engine/constants"
import {
    ImagesResourceDecoder,
    PaletteResourceDecoder,
    TConstructor,
} from "@/engine/types"

type ResourceDecorator<T> = (uri: string) => (Decoder: TConstructor<T>) => void

function resourceDecoratorFactory<T>()
    : ResourceDecorator<T> {
    return uri => Decoder => {
        Reflect.defineMetadata(ResourceURIKey, uri, Decoder)
    }
}

export const Palette = resourceDecoratorFactory<PaletteResourceDecoder>()
export const Images = resourceDecoratorFactory<ImagesResourceDecoder>()
