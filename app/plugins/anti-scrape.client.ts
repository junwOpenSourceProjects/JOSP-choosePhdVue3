function scrambleString(str: string): string {
  const chars = [...str]
  for (let i = 0; i < chars.length; i += 3) {
    if (i + 2 < chars.length) {
      ;[chars[i + 1], chars[i + 2]] = [chars[i + 2], chars[i + 1]]
    }
  }
  return chars.join('')
}

export default defineNuxtPlugin(() => {
  if (import.meta.server) return

  document.addEventListener('copy', (e: ClipboardEvent) => {
    const selection = window.getSelection()?.toString() || ''

    const target = e.target as HTMLElement
    if (target.closest('.allow-select, input, textarea, code, pre')) {
      return
    }

    e.preventDefault()
    const scrambled = scrambleString(selection)
    e.clipboardData?.setData('text/plain', scrambled)
  })
})
