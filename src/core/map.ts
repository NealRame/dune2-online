import { tileset } from "./data"
import { Tile } from "./types"

import { Painter, SceneItem } from "@/graphics"
import { createNoise2DGenerator, createRangeMapper, RectangularCoordinates, Size } from "@/maths"

import { clamp, flow, times } from "lodash"

export type LandMapConfig = {
    seed: number,
    // Terrain values
    terrainScale: number,               // clamped to [16, 64]
    terrainDetails: number,             // clamped to [ 1, 6 ]
    terrainSandThreshold: number,       // clamped to [ 0, 1 ]
    terrainRockThreshold: number,       // clamped to [ 0, 1 ]
    terrainMountainsThreshold: number,  // clamped to [ 0, 1 ]
    // Spice field values
    spiceScale: number,                 // clamped to [16, 64]
    spiceDetails: number,               // clamped to [ 1, 6 ]
    spiceThreshold: number,             // clamped to [ 0, 1 ]
}

enum TerrainType {
    Dunes = 0,
    Sand,
    Rock,
    Mountain,
}

type Terrain = {
    position: RectangularCoordinates,
    spice: number,
    type: TerrainType,
    tile: Tile,
}

type MapState = {
    map: Terrain[],
    parent: SceneItem | null,
}

function tileFromTypeAndSpice(type: TerrainType, spice: number): Tile {
    const terrainTiles = tileset("Terrain")

    switch (type) {
    case TerrainType.Sand:
        return terrainTiles[spice > 0 ? 191 : 127]
    case TerrainType.Dunes:
        return terrainTiles[spice > 0 ? 207 : 159]
    case TerrainType.Rock:
        return terrainTiles[143]
    case TerrainType.Mountain:
        return terrainTiles[160]
    }

    const _exhaustiveCheck: never = type
    return _exhaustiveCheck
}

function checkConfig(config: Partial<LandMapConfig>): LandMapConfig {
    return {
        seed: config.seed ?? Date.now(),
        // Terrain values
        terrainScale: clamp(Math.floor(config.terrainScale ?? 32), 16, 64),
        terrainDetails: clamp(Math.floor(config.terrainDetails ?? 1), 1, 6),
        terrainSandThreshold: clamp(config.terrainSandThreshold ?? 0.4, 0, 1),
        terrainRockThreshold: clamp(config.terrainRockThreshold ?? 0.65, 0, 1),
        terrainMountainsThreshold: clamp(config.terrainMountainsThreshold ?? 0.85, 0, 1),
        // Spice field values
        spiceScale: clamp(Math.floor(config.spiceScale ?? 16), 16, 64),
        spiceThreshold: clamp(config.spiceThreshold ?? 0.333, 0, 1),
        spiceDetails: clamp(Math.floor(config.spiceDetails ?? 1), 1, 6),
    }
}

function createTerrain(width: number, height: number, config: LandMapConfig) {
    const spiceAmount = flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
        (n: number) => n < config.spiceThreshold ? 1 : 0
    )
    const terrainType = flow(
        createNoise2DGenerator({
            seed: config.seed,
            scale: config.terrainScale,
            octaves: config.terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
        (v: number): TerrainType => {
            if (v < config.terrainSandThreshold) {
                return TerrainType.Dunes
            }
            if (v < config.terrainRockThreshold) {
                return TerrainType.Sand
            }
            if (v < config.terrainMountainsThreshold) {
                return TerrainType.Rock
            }
            return TerrainType.Mountain
        }
    )

    return times(width*height, (n: number): Terrain => {
        const position = { x: n%width, y: Math.floor(n/width) }
        const spice = spiceAmount(position)
        const type = terrainType(position)
        const tile = tileFromTypeAndSpice(type, spice)
        return {
            position,
            spice,
            type,
            tile,
        }
    })
}

export function createMap({ width, height }: Size, config: Partial<LandMapConfig>): SceneItem {
    const state: MapState = {
        map: createTerrain(width, height, checkConfig(config)),
        parent: null,
    }

    const getScale = () => state.parent?.getScale() ?? 1
    const getParent = () => state.parent

    return {
        get x(): number { return 0 },
        get y(): number { return 0 },
        get width(): number {
            return width*(state.map[0]?.tile[getScale()].width ?? 0)
        },
        get height(): number {
            return height*(state.map[0]?.tile[getScale()].height ?? 0)
        },
        getScale,
        getParent,
        setParent(parent: SceneItem | null): SceneItem {
            state.parent = parent
            return this
        },
        render(painter: Painter): SceneItem {
            const scale = getScale()
            for (const terrain of state.map) {
                const { x, y } = terrain.position
                const bitmap = terrain.tile[scale]
                painter.drawImageBitmap(bitmap, {
                    x: x*bitmap.width,
                    y: y*bitmap.height,
                })
            }
            return this
        }
    }
}
