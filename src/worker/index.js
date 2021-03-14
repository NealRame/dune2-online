import PromiseWorker from "promise-worker"
import Worker from "worker-loader!./file.worker"

const promiseWorker = new PromiseWorker(new Worker())

export function deserialize(dune2_RC) {
    return promiseWorker.postMessage(dune2_RC)
}

