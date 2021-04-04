import { DecodeMessage, RGBColor } from "../types"

import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

function decodePalette(paletteData: string): unknown {
    return (JSON.parse(paletteData) as Array<RGBColor>).map((color, index) => {
        const alpha = index > 0 ? 255 : 0
        return [...(color as RGBColor), alpha]
    })
}

function decodeSoundsets(soundsetsData: string): unknown {
    return JSON.parse(
        soundsetsData,
        (key: string, value: unknown) => {
            if (key !== ""
                && key !== "Atreides"
                && key !== "Harkonnen"
                && key !== "Ordos"
                && key !== "FX"
            ) {
                return new TextEncoder().encode(atob(value as string))
            }
            return value
        }
    )
}

function decodeTilesets(tilesetsData: string): unknown {
    return JSON.parse(
        tilesetsData,
        function (key: string, value: unknown) {
            if (key === "data" || key === "remap") {
                return new TextEncoder().encode(atob(value as string))
            } else if (key === "w") {
                this.width  = value
            } else if (key === "h") {
                this.height = value
            } else {
                return value
            }
        }
    )
}

registerPromiseWorker(async ({
    data,
    item,
}: DecodeMessage) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))

    switch (item) {
    case "palette":  return decodePalette(inflatedData)
    case "soundsets": return decodeSoundsets(inflatedData)
    case "tilesets":  return decodeTilesets(inflatedData)
    default:
        break
    }

    // exhaustiveness check
    const _exhaustiveCheck: never = item
    return _exhaustiveCheck
})
