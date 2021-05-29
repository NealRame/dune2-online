import { TileDescriptor } from "../../types"

import { ungzip } from "pako"

import registerPromiseWorker from "promise-worker/register"

type TileData = {
    shape: { columns: number, rows: number },
    images: number[],
}

registerPromiseWorker(async (data: Uint8Array) => {
    const inflatedData = (new TextDecoder()).decode(ungzip(data))
    return (JSON.parse(inflatedData) as TileData[]).map(({ shape, images }) => ({
        size: {
            width: shape.columns,
            height: shape.rows,
        },
        images,
    })) as TileDescriptor[]
})
