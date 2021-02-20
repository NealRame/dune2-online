export function noop() {}

export async function fetch_data(url, progress_cb = noop) {
    const response = await fetch(url)
    const reader = response.body.getReader()
    const content_length = Number(response.headers.get("Content-Length"))
    const data = new Uint8Array(content_length)

    for (let received_length = 0;;) {
        const {done, value} = await reader.read()

        if (value != null) {
            data.set(value, received_length)
            received_length += value.length
            progress_cb(received_length, content_length)
        }

        if (done) break
    }

    return data
}