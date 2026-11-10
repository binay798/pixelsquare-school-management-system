/* Self hosted TinyMCE loader + small rich text utilities shared by the
 * TinyMceEditor and TinyMceViewer components. */

const SCRIPT_ID = 'self-hosted-tinymce-script'

const BLOCKED_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'link',
  'meta',
  'base',
  'noscript',
]

const BLOCKED_URL_PREFIXES = ['javascript:', 'vbscript:', 'data:text/html']

const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*>/i

let loaderPromise: Promise<void> | null = null

/**
 * Script url configured through `VITE_TINYMCE_URL` (self hosted tinymce).
 */
export function getTinyMceScriptUrl(): string {
  const url = import.meta.env.VITE_TINYMCE_URL

  return typeof url === 'string' ? url.trim() : ''
}

/**
 * Base url of the self hosted tinymce distribution. TinyMCE resolves its
 * skins / themes / plugins relatively to this folder.
 */
export function getTinyMceBaseUrl(): string | null {
  const url = getTinyMceScriptUrl()
  const match = url.match(/^(.*)\/tinymce(?:\.min)?\.js(?:\?.*)?$/i)

  return match?.[1] ?? null
}

export function isTinyMceLoaded(): boolean {
  return typeof window !== 'undefined' && Boolean(window.tinymce)
}

/**
 * Injects the self hosted tinymce script once and resolves when the global
 * `window.tinymce` namespace is available.
 */
export function loadTinyMce(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('TinyMCE can only be loaded in the browser')
    )
  }

  if (window.tinymce) {
    return Promise.resolve()
  }

  if (loaderPromise) {
    return loaderPromise
  }

  const url = getTinyMceScriptUrl()

  if (!url) {
    return Promise.reject(new Error('VITE_TINYMCE_URL is not configured'))
  }

  loaderPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      SCRIPT_ID
    ) as HTMLScriptElement | null

    const handleLoad = () => {
      if (window.tinymce) {
        resolve()

        return
      }
      loaderPromise = null
      reject(new Error('TinyMCE script loaded but the global is missing'))
    }

    const handleError = () => {
      loaderPromise = null
      reject(new Error(`Unable to load TinyMCE from ${url}`))
    }

    if (existing) {
      existing.addEventListener('load', handleLoad)
      existing.addEventListener('error', handleError)

      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = url
    script.async = true
    script.addEventListener('load', handleLoad)
    script.addEventListener('error', handleError)
    document.head.appendChild(script)
  })

  return loaderPromise
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Removes scriptable markup (scripts, inline handlers, javascript: urls, ...)
 * from a stored rich text value before it is injected into the DOM.
 */
export function sanitizeRichText(html: string): string {
  if (!html) {
    return ''
  }

  if (typeof document === 'undefined') {
    return escapeHtml(html)
  }

  const container = document.createElement('div')
  container.innerHTML = html
  const content = container

  content.querySelectorAll(BLOCKED_TAGS.join(',')).forEach((node) => {
    node.parentNode?.removeChild(node)
  })

  content.querySelectorAll('*').forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      const value = attribute.value.replace(/\s+/g, ' ').trim().toLowerCase()

      if (name.startsWith('on')) {
        element.removeAttribute(attribute.name)

        return
      }

      if (
        ['href', 'src', 'xlink:href', 'formaction'].includes(name) &&
        BLOCKED_URL_PREFIXES.some((prefix) => value.startsWith(prefix))
      ) {
        element.removeAttribute(attribute.name)

        return
      }

      if (name === 'style' && value.includes('expression(')) {
        element.removeAttribute(attribute.name)
      }
    })

    if (element.tagName.toLowerCase() === 'a') {
      element.setAttribute('rel', 'noopener noreferrer')
      element.setAttribute('target', '_blank')
    }
  })

  return content.innerHTML
}

/**
 * Turns a stored value into html that can be rendered safely. Plain text
 * values (records saved before the rich text editor was introduced) keep
 * their line breaks.
 */
export function toRichTextHtml(content?: string | null): string {
  const raw = content ?? ''

  if (!raw.trim()) {
    return ''
  }

  if (!HTML_TAG_REGEX.test(raw)) {
    return escapeHtml(raw).replace(/\r?\n/g, '<br />')
  }

  return sanitizeRichText(raw)
}

/**
 * `true` when a rich text value has no visible content, so callers can render
 * their own empty state instead of an empty block.
 */
export function isRichTextEmpty(content?: string | null): boolean {
  if (!content) {
    return true
  }

  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length === 0
}
