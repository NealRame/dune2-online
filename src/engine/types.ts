export const ScaleFactors = [1, 2, 3, 4] as const
export type ScaleFactor = typeof ScaleFactors[number]

export type Image = Record<ScaleFactor, ImageBitmap>
