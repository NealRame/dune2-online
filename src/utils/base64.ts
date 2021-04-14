export function base64ToByteArray(b64String: string): Uint8Array {
    return new Uint8Array(atob(b64String).split("").map(c => c.charCodeAt(0)))
}
