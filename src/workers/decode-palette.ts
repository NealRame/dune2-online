import { Color } from "@/graphics"
import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

registerPromiseWorker(async (data: Uint8Array) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return (JSON.parse(inflatedData) as Array<Color.RGB>).map((color, index) => {
        const alpha = index > 0 ? 255 : 0
        return [...color, alpha]
    })
})
