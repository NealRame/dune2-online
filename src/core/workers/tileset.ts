import { CreateTileMessage } from "../types"
import { createTile } from "../tile"

import registerPromiseWorker from "promise-worker/register"

registerPromiseWorker(async (message: CreateTileMessage) => {
    return message.tilesData.map(tileData => {
        return createTile(tileData, message.palette)
    })
})
