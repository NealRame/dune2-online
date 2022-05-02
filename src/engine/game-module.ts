/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    type IGameEngine,
    type IGameModule,
} from "@/engine/types"

export class GameModule implements IGameModule {
    onStart(engine: IGameEngine): void {
    }

    onStop(engine: IGameEngine): void {
    }
}
