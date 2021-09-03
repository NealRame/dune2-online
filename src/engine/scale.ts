import { clamp } from "lodash"

export const ScaleFactors = [1, 2, 3, 4] as const

export const MinScaleFactor = ScaleFactors[0]
export const MaxScaleFactor = ScaleFactors[ScaleFactors.length - 1]

export type ScaleFactor = typeof ScaleFactors[number]

export function scaleDown(scale: ScaleFactor): ScaleFactor {
    return clamp(scale - 1, MinScaleFactor, MaxScaleFactor) as ScaleFactor
}

export function scaleUp(scale: ScaleFactor): ScaleFactor {
    return clamp(scale + 1, MinScaleFactor, MaxScaleFactor) as ScaleFactor
}
