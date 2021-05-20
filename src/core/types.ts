import { Color, Painter } from "@/graphics"
import { Rect, RectangularCoordinates, Size } from "@/maths"

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

// Image set
export const ImageSet = ["misc", "terrain", "units"] as const
export type Image = Record<ScaleFactor, ImageBitmap>
export type ImageLib = Record<typeof ImageSet[number], readonly Image[]>

// Game data
export type GameData = {
    palette: Palette,
    images: ImageLib,
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
