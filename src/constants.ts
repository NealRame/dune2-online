import { InjectionKey } from "vue"
import { type IEngine } from "./engine"

export const EngineKey: InjectionKey<IEngine> = Symbol("Engine")
