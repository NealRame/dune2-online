import { neighborhood } from "./utils"
import { generateMap } from "./generator"
import { imageSet } from "@/core/data"
import { Image, LandMapConfig, Neighborhood, ScaleFactor, Scene, SceneItem, Shape, Terrain, TerrainType } from "@/core/types"

import { Painter } from "@/graphics"
import { Rect, Vector } from "@/maths"

import { clamp } from "lodash"

type MapState = {
    map: Array<Terrain & { image: Image }>,
    parent: Scene | SceneItem | null,
}

function selectTile(
    terrain: Terrain,
    neighbors: Neighborhood<Terrain>,
    images: readonly Image[],
): Image {
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
        return images[128 + typeMask]
    case TerrainType.Dunes:
        return images[144 + typeMask]
    case TerrainType.Mountain:
        return images[160 + typeMask]
    case TerrainType.SpiceField:
        return images[176 + typeMask]
    case TerrainType.SaturatedSpiceField:
        return images[192 + typeMask]
    }

    return images[127]
}

function terrainTileSelector(shape: Shape)
    : (t: Terrain, i: number, m: Terrain[]) => [Terrain, Image] {
    const images = imageSet("terrain")
    const neighbors = neighborhood(shape)

    return (terrain, index, map) => [
        terrain,
        selectTile(terrain, neighbors(terrain, map), images)
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

export function createMap(shape: Shape, config: Partial<LandMapConfig>): SceneItem {
    const map = generateMap(shape, checkConfig(config))
        .map(terrainTileSelector(shape))
        .map(([terrain, image]) => Object.assign(terrain, { image }))

    const state: MapState = {
        map,
        parent: null,
    }

    const getSize = (scale: ScaleFactor) => {
        const image = state.map[0]?.image[scale]
        return {
            width: shape.columns*(image?.width ?? 0),
            height: shape.rows*(image?.height ?? 0),
        }
    }

    return {
        get position() {
            return { x: 0, y: 0 }
        },
        get parent(): Scene | SceneItem | null {
            return state.parent
        },
        set parent(parent: Scene | SceneItem | null) {
            state.parent = parent
        },
        getSize,
        getRect(scale: ScaleFactor): Rect {
            return new Rect({ x: 0, y: 0 }, getSize(scale))
        },
        update(): SceneItem {
            return this
        },
        render(painter: Painter, scale: ScaleFactor, viewport: Rect): SceneItem {
            for (const terrain of state.map) {
                const bitmap = terrain.image[scale]

                const { x, y } = terrain.position
                const { width, height } = bitmap

                const bitmapPos = new Vector(x*bitmap.width, y*bitmap.height)
                const bitmapRect = new Rect(bitmapPos, { width, height })

                if (viewport.intersects(bitmapRect)) {
                    bitmapPos.sub(viewport.topLeft())
                    painter.drawImageBitmap(bitmap, bitmapPos)
                }
            }
            return this
        }
    }
}
