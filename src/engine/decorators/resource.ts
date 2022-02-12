import "reflect-metadata"

import { GameResourcesMetadataKeys } from "@/engine/constants"

import {
    Service,
    Token,
} from "@/engine/injector"

import {
    IGameImagesDecoder,
    IGamePaletteDecoder,
    TConstructor,
} from "@/engine/types"

export interface IResourceMetadata {
    id: Token,
    uri: string,
}

type ResourceDecorator<T> = (meta: IResourceMetadata) => (Decoder: TConstructor<T>) => void

function isResourceMetadataKey(key: string)
    : key is keyof IResourceMetadata {
    return key === "id" || key === "uri"
}

function resourceDecoratorFactory<T>()
    : ResourceDecorator<T> {
    const decoderService = Service()
    return meta => Decoder => {
        decoderService(Decoder)
        for (const key of Object.keys(meta)) {
            if (isResourceMetadataKey(key)) {
                Reflect.defineMetadata(
                    GameResourcesMetadataKeys[key],
                    meta[key],
                    Decoder
                )
            }
        }
    }
}

export const Palette = resourceDecoratorFactory<IGamePaletteDecoder>()
export const Images = resourceDecoratorFactory<IGameImagesDecoder>()
