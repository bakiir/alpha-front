type SpecLike = {
  key?: string | null
  label?: string | null
  value?: string | null
}

/** Build cart card meta from real product fields only (no placeholders). */
export function buildCartItemSubtitle(parts: {
  age?: string | null
  material?: string | null
}): string | undefined {
  const bits: string[] = []
  const age = typeof parts.age === 'string' ? parts.age.trim() : ''
  const material = typeof parts.material === 'string' ? parts.material.trim() : ''

  if (age) {
    bits.push(age.startsWith('Возраст') ? age : `Возраст: ${age}`)
  }
  if (material) {
    bits.push(material)
  }

  return bits.length ? bits.join(' • ') : undefined
}

export function materialFromSpecifications(
  specs?: SpecLike[] | null,
): string | undefined {
  if (!Array.isArray(specs)) return undefined
  const row = specs.find(
    (s) => s?.key === 'material' || s?.label === 'Материал',
  )
  const value = typeof row?.value === 'string' ? row.value.trim() : ''
  return value || undefined
}
