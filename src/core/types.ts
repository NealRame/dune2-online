import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export interface DataProgressNotifier {
    begin(): void,
    setLabel(label: string): void,
    setValue(value: number): void,
    end(): void,
}

// Palette
export type Palette = readonly Color.RGBA[]

// Tile descriptor
export type TileDescriptor = {
    size: Size,
    images: number[],
}

// Image set
export const ImageSet = ["misc", "terrain", "units"] as const
export type Image = Record<ScaleFactor, ImageBitmap>
export type ImageLib = Record<typeof ImageSet[number], readonly Image[]>

// Game data
export type GameData = {
    palette: Palette,
    images: ImageLib,
    tiles: TileDescriptor[],
}

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    gridEnabled: boolean,
    readonly gridSpacing: number,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene, // eslint-disable-line no-use-before-define
    clear(): Scene,
    update(): Scene,
    render(painter: Painter): Scene,
    run(painter: Painter): Scene,
}

export interface SceneItem {
    position: Vector,
    size: Size,
    rect: Rect,
    update(): SceneItem,
    render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): SceneItem,
}

export type MapConfig = {
    // Noise seed
    seed: number,
    // Terrain values
    terrainScale: number,               // clamped to [16, 64]
    terrainDetails: number,             // clamped to [ 1, 6 ]
    terrainSandThreshold: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold: number,  // clamped to [ 0, 1 ]
    // Spice field values
    spiceScale: number,                 // clamped to [16, 64]
    spiceDetails: number,               // clamped to [ 1, 6 ]
    spiceThreshold: number,             // clamped to [ 0, 1 ]
    spiceSaturationThreshold: number    // clamped to [ spiceThreshold, 1 ]
}

export enum TerrainType {
    Dunes = 0,
    Sand,
    SpiceField,
    SaturatedSpiceField,
    Rock,
    Mountain,
}

export type Terrain = {
    position: RectangularCoordinates,
    spice: number,
    type: TerrainType
}

export type Neighborhood<T extends Terrain> = [T|null, T|null, T|null, T|null]
