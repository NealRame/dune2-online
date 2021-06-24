import * as Workers from "./workers"

import { GameData, ImageLib, ImageSet, Palette, TileDescriptor } from "@/dune2/types"

import { Image } from "@/engine"

import { fetchData } from "@/utils"

import { isNil } from "lodash"

interface DataProgressNotifier {
    begin(): void,
    setLabel(label: string): void,
    setValue(value: number|null): void,
    end(): void,
}

let gameData: GameData | null = null

async function fetchGameData(progress: DataProgressNotifier) {
    const fetchProgress = (current: number, total: number) => {
        progress.setValue(Math.min(current/total, 1))
    }

    // Fetch palette
    progress.setLabel("Fetching palette data ...")
    const paletteData = await fetchData("/assets/palette.json.gz", fetchProgress)
    const palette = await Workers.decodePalette(paletteData)

    // Fetch image set
    const fetchGameImageData = async (set: ImageSet) => {
        progress.setLabel(`Fetching ${set} data ...`)

        const data = await fetchData(
            `/assets/images.${set}.json.gz`,
            fetchProgress
        )

        progress.setLabel(`Decoding ${set} images ...`)
        progress.setValue(null)

        return await Workers.decodeImages(data, set, palette)
    }
    const miscImages = await fetchGameImageData("misc")
    const terrainImages = await fetchGameImageData("terrain")
    const unitsImages = await fetchGameImageData("units")

    // Fetch tiles mapping
    progress.setLabel("Fetching tiles mapping data ...")
    const tilesDescriptorsData = await fetchData("/assets/tiles.json.gz", fetchProgress)
    const tiles = await Workers.decodeTileDescriptors(tilesDescriptorsData, terrainImages)

    return {
        palette,
        tiles,
        images: {
            misc: miscImages,
            terrain: terrainImages,
            units: unitsImages,
        },
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

export function tiles(): TileDescriptor[] {
    return checkGameData().tiles
}
