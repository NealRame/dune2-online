import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size, Vector } from "@/maths"

export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Shape = {
    columns: number,
    rows: number,
}

export interface DataProgressNotifier {
    begin(): void,
    setLabel(label: string): void,
    setValue(value: number|null): void,
    end(): void,
}

// Palette
export type Palette = readonly Color.RGBA[]

// Image set
export const ImageSets = ["misc", "terrain", "units"] as const
export type Image = Record<ScaleFactor, ImageBitmap>
export type ImageSet = typeof ImageSets[number]
export type ImageLib = Record<ImageSet, readonly Image[]>

// Tile descriptor
export type TileDescriptor = {
    size: Size,
    images: Image[],
}

// Game data
export type GameData = {
    palette: Palette,
    images: ImageLib,
    tiles: TileDescriptor[],
}

export interface Scene {
    scale: ScaleFactor,
    viewport: Rect | null,
    readonly gridUnit: number,
    readonly gridSpacing: number,
    gridEnabled: boolean,
    readonly rect: Rect,
    addItem(item: SceneItem): Scene, // eslint-disable-line no-use-before-define
    clear(): Scene,
    update(): Scene,
    render(painter: Painter): Scene,
    run(painter: Painter): Scene,
}

export interface SceneItem {
    readonly scene: Scene,
    position: Vector,
    readonly size: Size,
    readonly rect: Rect,
    update(): SceneItem,
    render(painter: Painter, gridSpacing: number, scale: ScaleFactor, viewport: Rect): SceneItem,
}

export type MapConfig = {
    size: Size,
    // Chunk
    chunk?: boolean,
    chunkSize?: Size,
    // Noise seed
    seed?: number,
    // Terrain values
    terrainScale?: number,               // clamped to [16, 64]
    terrainDetails?: number,             // clamped to [ 1, 6 ]
    terrainSandThreshold?: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold?: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold?: number,  // clamped to [ 0, 1 ]
    // Spice field values
    spiceScale?: number,                 // clamped to [16, 64]
    spiceDetails?: number,               // clamped to [ 1, 6 ]
    spiceThreshold?: number,             // clamped to [ 0, 1 ]
    spiceSaturationThreshold?: number    // clamped to [ spiceThreshold, 1 ]
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
