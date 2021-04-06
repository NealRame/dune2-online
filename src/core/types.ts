import { Color } from "@/graphics"

// Palette
export type RGBColor = Color.RGB
export type RGBAColor = Color.RGBA
export type Palette = Array<RGBAColor>

// Tileset
export const Tilesets = ["Terrain", "Units"] as const
export type Tile = {
    1: ImageData,
    2: ImageData,
    3: ImageData,
    4: ImageData,
}
export type TilesetsKeys = typeof Tilesets[number]
export type TilesetMap = Partial<Record<TilesetsKeys, readonly Tile[]>>

// Soundsets
export const Soundsets = ["Atreides", "Harkonnen", "Ordos", "FX"] as const
export type SoundsetsKeys = typeof Soundsets[number]
export type Soundset = {
    [key: string]: Uint8Array
}
export type SoundsetMap = Record<SoundsetsKeys, Soundset>

// Game data
export const GameDataItems = ["palette", "tilesets", "soundsets"] as const
export type GameDataItemsKey = typeof GameDataItems[number]
export type GameData = Record<GameDataItemsKey, unknown>

// Workers message
export interface DecodeMessage {
    data: Uint8Array,
    item: typeof GameDataItems[number],
}

export interface TileData {
    width: number,
    height: number,
    data: Uint8Array,
    remap?: Uint8Array,
}

export interface TilsetsData {
    Terrain: Array<TileData>,
    Units: Array<TileData>,
}

export interface CreateTileMessage {
    tilesData: Array<TileData>,
    palette: Palette,
}
