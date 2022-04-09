import { Config, ITerrainData } from "./types"

import { Token } from "@/engine/injector"
import { ILand } from "@/engine"

export const id = new Token<ILand<ITerrainData, Config>>("land")

export * from "./generator"
export * from "./color-provider"
export * from "./tiles-provider"
export * from "./types"
