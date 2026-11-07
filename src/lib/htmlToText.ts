/** Shiki 预着色 html → 纯文本（复制用）：浏览器解析后取 textContent，去首尾空行 */
export function htmlToText(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return (div.textContent ?? '').replace(/^\n/, '').replace(/\n$/, '')
}
