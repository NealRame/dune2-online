/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import {
    type IGameEngine,
    type IGameController,
} from "@/engine/types"

export class GameController implements IGameController {
    onStart(engine: IGameEngine): void {
    }

    onStop(engine: IGameEngine): void {
    }
}
