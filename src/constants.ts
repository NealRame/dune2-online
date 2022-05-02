import { InjectionKey } from "vue"
import { type IGameEngine } from "./engine"

export const EngineKey: InjectionKey<IGameEngine> = Symbol("Engine")
