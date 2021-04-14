import { Color } from "@/graphics"

// Palette
export type Palette = readonly Color.RGBA[]

// Tileset
export type Tile = {
    1: ImageData,
    2: ImageData,
    3: ImageData,
    4: ImageData,
}
export type Tileset = readonly Tile[]
export type TilesetGroup = "Terrain" | "Units"
export type TilesetMap = Record<TilesetGroup, Tileset>

// Soundsets
export type Soundset = {
    [key: string]: Uint8Array
}
export type SoundsetGroup = "Atreides" | "Harkonnen" | "Ordos" | "FX"
export type SoundsetMap = Record<SoundsetGroup, Soundset>

// Game data
export type GameData = {
    palette: Palette,
    tilesets: TilesetMap,
    soundsets: SoundsetMap,
}
