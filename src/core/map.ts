import { tileset } from "./data"
import { Tile, Tileset, ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { createNoise2DGenerator, createRangeMapper, Rect, RectangularCoordinates, Size } from "@/maths"

import { chain, clamp, flow, isNil, times } from "lodash"

export type LandMapConfig = {
    // Noise seed
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
    spiceSaturationThreshold: number    // clamped to [ spiceThreshold, 1 ]
}

enum TerrainType {
    Dunes = 0,
    Sand,
    SpiceField,
    SaturatedSpiceField,
    Rock,
    Mountain,
}

type Terrain = {
    position: RectangularCoordinates,
    spice: number,
    type: TerrainType
}

type MapState = {
    map: Array<Terrain & { tile: Tile }>,
    parent: Scene | SceneItem | null,
}

type Neighborhood<T extends Terrain> = [T|null, T|null, T|null, T|null]

function indexToPositionConverter({ width }: Size)
    : (n: number) => RectangularCoordinates {
    return n => ({ x: n%width, y: Math.floor(n/width) })
}

function positionToIndexConverter({ width, height }: Size)
    : (p: RectangularCoordinates) => number {
    return ({ x, y }) => {
        return x >= 0 && x < width && y >= 0 && y < height
            ? y*width + x
            : -1
    }
}

function neighborhood<T extends Terrain>(size: Size)
    : (t: T, m: T[]) => Neighborhood<T> {
    const positionToIndex = positionToIndexConverter(size)
    return (terrain, map) => {
        const { x, y } = terrain.position
        const north = positionToIndex({ x, y: y - 1 })
        const east  = positionToIndex({ x: x + 1, y })
        const south = positionToIndex({ x, y: y + 1 })
        const west  = positionToIndex({ x: x - 1, y })
        return [
            north >= 0 ? map[north] : null,
            east  >= 0 ? map[east]  : null,
            south >= 0 ? map[south] : null,
            west  >= 0 ? map[west]  : null,
        ]
    }
}

function selectTile(
    terrain: Terrain,
    neighbors: Neighborhood<Terrain>,
    tiles: Tileset
): Tile {
    const typeMask = neighbors
        .map((neighbor): number => {
            const type = (neighbor ?? terrain).type
            if (terrain.type === TerrainType.Rock) {
                return (type === TerrainType.Rock || type === TerrainType.Mountain) ? 1 : 0
            }
            if (terrain.type === TerrainType.SpiceField) {
                return (type === TerrainType.SpiceField || type === TerrainType.SaturatedSpiceField) ? 1 : 0
            }
            return type === terrain.type ? 1 : 0
        })
        .reduce((prev, cur, index) => prev + (cur << index), 0)

    switch (terrain.type) {
    case TerrainType.Rock:
        return tiles[128 + typeMask]
    case TerrainType.Dunes:
        return tiles[144 + typeMask]
    case TerrainType.Mountain:
        return tiles[160 + typeMask]
    case TerrainType.SpiceField:
        return tiles[176 + typeMask]
    case TerrainType.SaturatedSpiceField:
        return tiles[192 + typeMask]
    }

    return tiles[127]
}

function terrainTileSelector(size: Size)
    : (t: Terrain, i: number, m: Terrain[]) => [Terrain, Tile] {
    const tiles = tileset("Terrain")
    const neighbors = neighborhood(size)

    return (terrain, index, map) => [
        terrain,
        selectTile(terrain, neighbors(terrain, map), tiles)
    ]
}

function checkConfig(config: Partial<LandMapConfig>): LandMapConfig {
    const spiceThreshold = clamp(config.spiceThreshold ?? 0.6, 0, 1)
    const spiceSaturationThreshold = clamp(config.spiceSaturationThreshold ?? (1 + spiceThreshold)/2, spiceThreshold, 1)
    return {
        // Noise seed
        seed: config.seed ?? Date.now(),
        // Terrain values
        terrainScale: clamp(Math.floor(config.terrainScale ?? 32), 16, 64),
        terrainDetails: clamp(Math.floor(config.terrainDetails ?? 1), 1, 6),
        terrainSandThreshold: clamp(config.terrainSandThreshold ?? 2/5, 0, 1),
        terrainRockThreshold: clamp(config.terrainRockThreshold ?? 5/8, 0, 1),
        terrainMountainsThreshold: clamp(config.terrainMountainsThreshold ?? 7/8, 0, 1),
        // Spice field values
        spiceScale: clamp(Math.floor(config.spiceScale ?? 16), 16, 64),
        spiceDetails: clamp(Math.floor(config.spiceDetails ?? 1), 1, 6),
        spiceThreshold,
        spiceSaturationThreshold,
    }
}

function terrainTypeGenerator(config: LandMapConfig)
    : (t: Partial<Terrain>) => Partial<Terrain> {
    const terrainNoise = flow(
        createNoise2DGenerator({
            seed: config.seed,
            scale: config.terrainScale,
            octaves: config.terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
    )
    return terrain => {
        const { position } = terrain

        if (isNil(position)) {
            throw new Error("position not initialized!")
        }

        const v = terrainNoise(position)

        if (v < config.terrainSandThreshold) {
            terrain.type = TerrainType.Dunes
        } else if (v < config.terrainRockThreshold) {
            terrain.type = TerrainType.Sand
        } else if (v < config.terrainMountainsThreshold) {
            terrain.type = TerrainType.Rock
        } else {
            terrain.type = TerrainType.Mountain
        }

        return terrain
    }
}

function spiceFieldGenerator(config: LandMapConfig)
    : (t: Partial<Terrain>) => Partial<Terrain> {
    const spiceNoise = flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1)
    )

    return terrain => {
        const { position, type } = terrain

        if (isNil(position)) {
            throw new Error("position not initialized!")
        }

        if (isNil(type)) {
            throw new Error("type not initialized!")
        }

        if (type === TerrainType.Sand || type === TerrainType.Dunes) {
            const n = spiceNoise(position)

            if (n >= config.spiceThreshold && n < config.spiceSaturationThreshold) {
                terrain.type = TerrainType.SpiceField
                terrain.spice = 0.5
            } else if (n >= config.spiceSaturationThreshold) {
                terrain.type = TerrainType.SaturatedSpiceField
                terrain.spice = 1.0
            }
        }

        return terrain
    }
}

function terrainGenerator(config: LandMapConfig)
    : (p: RectangularCoordinates) => Terrain {
    const generateTerrainType = terrainTypeGenerator(config)
    const generateSpiceField = spiceFieldGenerator(config)
    return position => {
        return chain({ position })
            .tap(generateTerrainType)
            .tap(generateSpiceField)
            .value() as Terrain
    }
}

function createTerrain(size: Size, config: LandMapConfig) {
    return times(size.width*size.height, indexToPositionConverter(size))
        .map(terrainGenerator(config))
        .map(terrainTileSelector(size))
        .map(([terrain, tile]) => Object.assign({}, terrain, { tile }))
}

export function createMap(size: Size, config: Partial<LandMapConfig>): SceneItem {
    const state: MapState = {
        map: createTerrain(size, checkConfig(config)),
        parent: null,
    }

    const getScale = () => state.parent?.scale ?? 1
    const getWidth = () => size.width*(state.map[0]?.tile[getScale()].width ?? 0)
    const getHeight = () => size.height*(state.map[0]?.tile[getScale()].height ?? 0)

    return {
        get x(): number { return 0 },
        get y(): number { return 0 },
        get width(): number {
            return getWidth()
        },
        get height(): number {
            return getHeight()
        },
        get rect(): Rect {
            return new Rect({ x: 0, y: 0 }, {
                width: getWidth(),
                height: getHeight()
            })
        },
        get scale(): ScaleFactor {
            return getScale()
        },
        get parent(): Scene | SceneItem | null {
            return state.parent
        },
        set parent(parent: Scene | SceneItem | null) {
            state.parent = parent
        },
        render(painter: Painter, viewport: Rect): SceneItem {
            const scale = getScale()
            for (const terrain of state.map) {
                const { x, y } = terrain.position
                const bitmap = terrain.tile[scale]
                painter.drawImageBitmap(bitmap, {
                    x: x*bitmap.width - viewport.leftX,
                    y: y*bitmap.height - viewport.topY,
                })
            }
            return this
        }
    }
}
