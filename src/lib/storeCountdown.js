export function pad2(value) {
  return String(value).padStart(2, '0')
}

export function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`
}

export function formatCountdownLine(prefix, remainingMs) {
  const label = String(prefix || '').trim()
  const timer = formatCountdown(remainingMs)
  return label ? `${label} ${timer}`.trim() : timer
}
