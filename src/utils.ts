export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function avatarLabel(name: string) {
  return name.replace(/\D/g, '').slice(-2) || name.slice(0, 1).toUpperCase()
}
