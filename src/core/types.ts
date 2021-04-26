import { Color, ScaleFactor } from "@/graphics"

export interface DataProgressNotifier {
    begin(): void,
    setLabel(label: string): void,
    setValue(value: number): void,
    end(): void,
}

// Palette
export type Palette = readonly Color.RGBA[]

// Tileset
export type Tile = Record<ScaleFactor, ImageBitmap>
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
