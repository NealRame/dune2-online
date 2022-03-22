import { ITerrainData } from "./types"

import { Token } from "@/engine/injector"
import { ILand } from "@/engine"

export const id = new Token<ILand<ITerrainData>>("land")

export * from "./generator"
export * from "./tiles-provider"
export * from "./types"
