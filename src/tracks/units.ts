const YEAR = 365.25 * 24 * 3600

/** Turns a number of seconds into something a person can picture, e.g. "3.2 milliseconds" or "11,100 years". */
export function formatDuration(seconds: number): string {
  const units: [number, string][] = [
    [YEAR, 'year'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'minute'],
    [1, 'second'],
    [1e-3, 'millisecond'],
    [1e-6, 'microsecond'],
    [1e-9, 'nanosecond'],
  ]
  for (const [size, name] of units) {
    if (seconds >= size || size === 1e-9) {
      const v = seconds / size
      const text = v >= 10 ? Math.round(v).toLocaleString('en-US') : v.toPrecision(2).replace(/\.0+$/, '')
      return `${text} ${name}${text === '1' ? '' : 's'}`
    }
  }
  return `${seconds} seconds`
}

/** 1500 → "1,500", 3.5e11 → "350 billion". */
export function formatCount(n: number): string {
  const units: [number, string][] = [
    [1e15, 'quadrillion'],
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
  ]
  for (const [size, name] of units) {
    if (n >= size) return `${Number((n / size).toPrecision(3)).toLocaleString('en-US')} ${name}`
  }
  return Math.round(n).toLocaleString('en-US')
}

/** Bytes → "14 GB", "256 KB" (decimal units, like GPU spec sheets). */
export function formatBytes(bytes: number): string {
  const units: [number, string][] = [
    [1e12, 'TB'],
    [1e9, 'GB'],
    [1e6, 'MB'],
    [1e3, 'KB'],
  ]
  for (const [size, name] of units) {
    if (bytes >= size) return `${Number((bytes / size).toPrecision(3))} ${name}`
  }
  return `${bytes} bytes`
}
