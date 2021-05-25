import { TileDescriptor } from "../types"

import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

registerPromiseWorker(async (data: Uint8Array) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return JSON.parse(inflatedData) as TileDescriptor[]
})
