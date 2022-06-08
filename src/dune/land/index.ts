import { Config, ITerrainData } from "./types"

import { Generator } from "./generator"
import { ColorsProvider } from "./color-provider"
import { TilesProvider } from "./tiles-provider"

import { Token } from "@/engine/injector"

import * as Engine from "@/engine"

export const id: Token<Engine.Land.ILand<ITerrainData, Config>> = Symbol("land")

export * from "./generator"
export * from "./color-provider"
export * from "./tiles-provider"
export * from "./types"

Engine.Land.define({
    Generator,
    ColorsProvider,
    TilesProvider,
})
