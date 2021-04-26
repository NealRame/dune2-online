import { CreateTileMessage, createTile } from "@/core"

import registerPromiseWorker from "promise-worker/register"

registerPromiseWorker(async (message: CreateTileMessage) => {
    return message.tilesData.map(tileData => {
        return createTile(tileData, message.palette)
    })
})
