/**
 * Create a range mapping function.
 * @param iMin input range lower bound
 * @param iMax input range upper bound
 * @param oMin output range lower bound
 * @param oMax output range upper bound
 * @returns a function
 */
export function createRangeMapper(
    iMin: number,
    iMax: number,
    oMin: number,
    oMax: number,
): (n: number) => number {
    return (n: number) => (n - iMin)/(iMax - iMin)*(oMax - oMin) + oMin
}
