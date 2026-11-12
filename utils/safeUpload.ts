/** Client-side guard; mirrors alpha_back App\Support\SafeUpload allowlist (not full content scan). */

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])

const BLOCKED_EXTENSIONS = new Set([
  'php',
  'phtml',
  'phar',
  'html',
  'htm',
  'svg',
  'js',
  'mjs',
  'exe',
  'bat',
  'cmd',
  'sh',
])

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export function fileExtension(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? ''
  const idx = base.lastIndexOf('.')
  if (idx <= 0) {
    return ''
  }
  return base.slice(idx + 1).toLowerCase()
}

export function isAllowedClientImage(file: File): boolean {
  const ext = fileExtension(file.name)
  if (BLOCKED_EXTENSIONS.has(ext)) {
    return false
  }
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return false
  }

  const type = (file.type || '').toLowerCase()
  if (type !== '' && !ALLOWED_MIMES.has(type)) {
    return false
  }

  return true
}
