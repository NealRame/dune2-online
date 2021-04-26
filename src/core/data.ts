import { DataProgressNotifier, GameData, Palette, SoundsetMap, Tileset, TilesetGroup, TilesetMap } from "./types"
import * as Workers from "./workers"

import { fetchData } from "@/utils"
import { isNil } from "lodash"

async function fetchGameData(progress: DataProgressNotifier) {
    type FetchedData = Record<keyof GameData, Uint8Array>

    const fetchedData: Partial<FetchedData> = {}
    for (const item of ["palette", "tilesets", "soundsets"] as const) {
        progress.setLabel(`Fetching ${item} ...`)
        fetchedData[item] = await fetchData(
            `/assets/${item}.json.gz`,
            (current: number, total: number) => {
                progress.setValue(Math.min(current/total, 1))
            }
        )
    }
    return fetchedData as FetchedData
}

async function decodeGameData(progress: DataProgressNotifier) {
    const fetchedData = await fetchGameData(progress)
    const gameData: Partial<GameData> = {}

    progress.setLabel("Decoding palette ...")
    gameData.palette = await Workers.decodePalette(
        fetchedData.palette
    ) as Palette
    progress.setValue(1/3)

    progress.setLabel("Decoding tilesets ...")
    gameData.tilesets = await Workers.decodeTilesets(
        fetchedData.tilesets, gameData.palette
    ) as TilesetMap
    progress.setValue(2/3)

    progress.setLabel("Decoding soundsets ...")
    gameData.soundsets = await Workers.decodeSoundsets(
        fetchedData.soundsets
    ) as SoundsetMap
    progress.setValue(3/3)

    return gameData as GameData
}

let gameData: GameData | null = null

function checkGameData(): GameData {
    if (isNil(gameData)) {
        throw new Error("GameData must be fetched and decoded first")
    }
    return gameData
}

export async function load(progress: DataProgressNotifier): Promise<void> {
    if (isNil(gameData)) {
        progress.begin()
        gameData = await decodeGameData(progress)
        progress.end()
    }
}

export function palette(): Palette {
    return checkGameData().palette
}

export function tileset(group: TilesetGroup): Tileset {
    return checkGameData().tilesets[group]
}

export function tilesets(): TilesetMap {
    return checkGameData().tilesets
}
