import { DataProgressNotifier, GameData, Image, ImageLib, ImageSet, Palette } from "./types"
import * as Workers from "./workers"

import { fetchData } from "@/utils"
import { isNil } from "lodash"

let gameData: GameData | null = null

async function fetchGameData(progress: DataProgressNotifier) {
    const fetchProgress = (current: number, total: number) => {
        progress.setValue(Math.min(current/total, 1))
    }

    // Fetch palette
    progress.setLabel("Fetching palette data ...")
    const paletteData = await fetchData("/assets/palette.json.gz", fetchProgress)
    const palette = await Workers.decodePalette(paletteData) as Palette

    // Fetch image set
    const images = await Promise.all(ImageSet.map(async set => {
        progress.setLabel(`Fetching ${set} data ...`)
        const data = await fetchData(
            `/assets/images.${set}.json.gz`,
            fetchProgress
        )

        progress.setLabel(`Decoding ${set} images ...`)
        return {
            [set]: await Workers.decodeTilesets(data, palette) as Image[]
        }
    }))

    return {
        palette,
        images: Object.assign({}, ...images) as ImageLib
    }
}

function checkGameData(): GameData {
    if (isNil(gameData)) {
        throw new Error("GameData must be fetched and decoded first")
    }
    return gameData
}

export async function load(progress: DataProgressNotifier): Promise<void> {
    if (isNil(gameData)) {
        progress.begin()
        gameData = await fetchGameData(progress)
        progress.end()
    }
}

export function palette(): Palette {
    return checkGameData().palette
}

export function imageSet(set: keyof ImageLib): readonly Image[] {
    return checkGameData().images[set]
}

export function imageLib(): ImageLib {
    return checkGameData().images
}
