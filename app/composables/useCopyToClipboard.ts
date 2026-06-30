export function useCopyToClipboard() {
  const toast = useToast()

  async function copy(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: '已复制', color: 'success', duration: 2000 })
      return true
    } catch {
      toast.add({ title: '复制失败', color: 'error', duration: 2000 })
      return false
    }
  }

  return { copy }
}
