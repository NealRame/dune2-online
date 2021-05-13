import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

export type ScaleFactor = 1 | 2 | 3 | 4

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

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    gridEnabled: boolean,
    readonly gridSpacing: number,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene, // eslint-disable-line no-use-before-define
    clear(): Scene,
    render(painter: Painter): Scene,
    run(painter: Painter): Scene,
}

export interface SceneItem extends RectangularCoordinates, Size {
    parent: Scene | SceneItem | null,
    readonly rect: Rect,
    readonly scale: ScaleFactor,
    render(painter: Painter, viewport: Rect): SceneItem,
}
