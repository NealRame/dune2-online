import * as DuneRC from "../core/dune2-rc"
import {loadPalette} from "../core/palette"
import {loadTilesets} from "../core/tile"

import registerPromiseWorker from "promise-worker/register"

registerPromiseWorker(async bytes => {
    const data = DuneRC.Data.deserializeBinary(bytes)
    const palette = loadPalette(data)
    const tilesets = loadTilesets(data, palette)

    return tilesets
})
