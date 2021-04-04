import { isNil, noop } from "lodash"

export type FetchDataProgressCallback =
    (current: number, total: number) => void
    | typeof noop

export async function fetchData(
    url: RequestInfo,
    progress_cb: FetchDataProgressCallback = noop
): Promise<Uint8Array> {
    const response = await fetch(url)
    const reader = response.body?.getReader()

    if (isNil(reader)) {
        throw new Error("Empty response")
    }

    let receivedLength = 0
    const contentLength = Number(response.headers.get("Content-Length"))
    const data = new Uint8Array(contentLength)

    for (;;) {
        const { done, value } = await reader.read()

        if (value != null) {
            data.set(value, receivedLength)
            receivedLength += value.length
            progress_cb(receivedLength, contentLength)
        }

        if (done) break
    }

    return data
}
