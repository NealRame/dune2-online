import { tileset } from "./data"
import { Tile, Tileset, ScaleFactor, Scene, SceneItem } from "./types"

import { Painter } from "@/graphics"
import { createNoise2DGenerator, createRangeMapper, Rect, RectangularCoordinates, Size } from "@/maths"

import { clamp, cond, conforms, constant, flow, isNil, negate, stubTrue, times } from "lodash"
import { equals } from "lodash/fp"

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
            return type === terrain.type ? 1 : 0
        })
        .reduce((prev, cur, index) => prev + (cur << index), 0)
    const spiceMask = neighbors
        .map((neighbor): number => {
            if (isNil(neighbor)) return terrain.spice > 0 ? 1 : 0
            if (neighbor.type === TerrainType.Sand || neighbor.type === TerrainType.Dunes) return neighbor.spice > 0 ? 1 : 0
            return 0
        })
        .reduce((prev, cur, index) => prev + (cur << index), 0)

    return cond([[
        conforms({
            type: equals(TerrainType.Sand),
            spice: negate(equals(0)),
        }),
        () => tiles[176 + spiceMask]
    ], [
        conforms({
            type: equals(TerrainType.Dunes),
            spice: negate(equals(0)),
        }),
        () => tiles[192 + typeMask]
    ], [
        conforms({
            type: equals(TerrainType.Dunes),
        }),
        () => tiles[144 + typeMask]
    ], [
        conforms({
            type: equals(TerrainType.Rock),
        }),
        () => tiles[128 + typeMask]
    ], [
        conforms({
            type: equals(TerrainType.Mountain),
        }), () => tiles[160 + typeMask]
    ], [
        stubTrue,
        constant(tiles[127])
    ]])(terrain)
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
    return {
        // Noise seed
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

function terrainTypeGenerator(config: LandMapConfig): (p: RectangularCoordinates) => TerrainType {
    return flow(
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
}

function spiceAmountGenerator(config: LandMapConfig): (p: RectangularCoordinates) => number {
    return flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
        (n: number) => n < config.spiceThreshold ? 1 : 0
    )
}

function terrainGenerator(config: LandMapConfig): (p: RectangularCoordinates) => Terrain {
    const generateTerrainType = terrainTypeGenerator(config)
    const generateSpiceAmount = spiceAmountGenerator(config)

    return position => {
        const spice = generateSpiceAmount(position)
        const type = generateTerrainType(position)
        return { position, spice, type }
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
