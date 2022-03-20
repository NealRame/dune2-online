import { ILandConfig, ITerrainData, TerrainType } from "./types"

import * as Engine from "@/engine"
import { Inject } from "@/engine/injector"
import { createIndexToPositionConverter } from "@/engine/land/utils"
import { createNoise2DGenerator, createRangeMapper, ISize2D, IVector2D } from "@/maths"

import { chain, flow, isNil, omit, times } from "lodash"

function createTerrainTypeGenerator(config: Required<ILandConfig>)
    : (t: Partial<ITerrainData> & IVector2D) => Partial<ITerrainData> {
    const terrainNoise = flow(
        createNoise2DGenerator({
            seed: config.seed,
            scale: config.terrainScale,
            octaves: config.terrainDetails,
        }),
        createRangeMapper(-1, 1, 0, 1),
    )
    return terrain => {
        const v = terrainNoise(terrain)

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

function createSpiceFieldGenerator(config: Required<ILandConfig>)
    : (t: Partial<ITerrainData> & IVector2D) => Partial<ITerrainData> {
    const spiceNoise = flow(
        createNoise2DGenerator({
            seed: config.seed + 1,
            scale: config.spiceScale,
            octaves: config.spiceDetails,
        }),
        createRangeMapper(-1, 1, 0, 1)
    )

    return terrain => {
        const { type } = terrain

        if (isNil(type)) {
            throw new Error("type not initialized!")
        }

        if (type === TerrainType.Sand || type === TerrainType.Dunes) {
            const n = spiceNoise(terrain)

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

function createLandDataGenerator(landConfig: ILandConfig)
    : (p: IVector2D) => ITerrainData {
    const generateTerrainType = createTerrainTypeGenerator(landConfig)
    const generateSpiceField = createSpiceFieldGenerator(landConfig)

    return position => {
        return omit(
            chain(position as Partial<ITerrainData> & IVector2D)
                .tap(generateTerrainType)
                .tap(generateSpiceField)
                .value(),
            ["x", "y"]
        ) as ITerrainData
    }
}

@Engine.Decorators.LandConfigurationProvider()
export class ConfigProvider implements Engine.ILandConfigProvider<ILandConfig> {
    private config_: ILandConfig

    constructor() {
        this.config_ = {
            // Noise seed
            seed: Date.now(),
            // Terrain values
            terrainScale: 32,
            terrainDetails: 1,
            terrainSandThreshold: 2/5,
            terrainRockThreshold: 5/8,
            terrainMountainsThreshold: 7/8,
            // Spice field values
            spiceScale: 16,
            spiceDetails: 1,
            spiceThreshold: 0.6,
            spiceSaturationThreshold: 0.8,
        }
    }

    getConfig(): ILandConfig {
        return { ...this.config_ }
    }
}

@Engine.Decorators.LandGenerator()
export class Generator {
    constructor(
        @Inject(ConfigProvider) private configProvider_: ConfigProvider,
    ) { }

    generate(landSize: ISize2D): Array<ITerrainData> {
        const landConfig = this.configProvider_.getConfig()
        const generateTerrain = createLandDataGenerator(landConfig)
        const indexToPosition = createIndexToPositionConverter(landSize)

        return times(landSize.width*landSize.height, flow(
            indexToPosition,
            generateTerrain,
        ))
    }
}
