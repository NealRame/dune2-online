import { Image, Palette } from "@/engine/scene"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface TConstructor<T = any> {
    new(...args: Array<never>): T
}

/******************************************************************************
 * Palettes resources metadata
 *****************************************************************************/
export interface PaletteResourceDecoder {
    decode(data: Uint8Array): Promise<Palette>
}

/******************************************************************************
 * Images set resources metadata
 *****************************************************************************/
export interface ImagesResourceDecoder {
    decode(data: Uint8Array): Promise<Array<Image>>
}

export interface GameMetadata {
    resources?: Array<TConstructor>
}
