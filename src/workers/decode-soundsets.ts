import { base64ToByteArray } from "@/utils"

import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

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
                return base64ToByteArray(value as string)
            }
            return value
        }
    )
}

registerPromiseWorker(async (data: Uint8Array) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return decodeSoundsets(inflatedData)
})
