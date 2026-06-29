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

  // ---- copy 事件拦截 ----
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

  // ---- 右键菜单拦截 ----
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    // 放行: input / textarea / a 标签 / 图片 / 允许选中的区域
    if (target.closest('input, textarea, a, img, .allow-select, [contenteditable]')) {
      return
    }
    e.preventDefault()
  })

  // ---- 打印前拦截: 插入干扰水印 ----
  const watermarkId = 'anti-print-watermark'
  let watermarkEl: HTMLElement | null = null

  const injectWatermark = () => {
    if (document.getElementById(watermarkId)) return
    watermarkEl = document.createElement('div')
    watermarkEl.id = watermarkId
    watermarkEl.innerHTML = [
      'JOSP-choosePhd · 数据受保护',
      '请通过 choosePhd.com 正常访问',
      '登录后解锁完整排名数据',
    ].join('&emsp;&emsp;')
    watermarkEl.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:99999;' +
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:40px;' +
      'font-size:18px;color:rgba(0,0,0,0.12);font-weight:600;letter-spacing:2px;' +
      'transform:rotate(-15deg);white-space:nowrap;'
    document.body.appendChild(watermarkEl)
  }

  const removeWatermark = () => {
    if (watermarkEl) {
      watermarkEl.remove()
      watermarkEl = null
    }
  }

  if (window.matchMedia) {
    window.matchMedia('print').addEventListener('change', (e) => {
      if (e.matches) {
        injectWatermark()
      } else {
        removeWatermark()
      }
    })
  }

  window.addEventListener('beforeprint', injectWatermark)
  window.addEventListener('afterprint', removeWatermark)
})
