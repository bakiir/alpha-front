export interface SkillItem {
  id: number
  slug: string
  name: string
  sort_order: number
}

let skillsInflight: Promise<SkillItem[]> | null = null
let skillsInflightLocale: string | null = null

function normalizeSkills(raw: unknown): SkillItem[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item: any) => {
      const slug = String(item?.slug ?? '').trim()
      if (!slug) return null
      return {
        id: Number(item.id),
        slug,
        name: String(item.name ?? ''),
        sort_order: Number(item.sort_order ?? 0),
      }
    })
    .filter(Boolean) as SkillItem[]
}

export const useSkills = () => {
  const { request } = useApi()
  const { cmsLocale } = useCmsLocale()
  const skills = useState<SkillItem[]>('catalog-skills', () => [])
  const skillsLocale = useState<string | null>('catalog-skills-locale', () => null)

  const loadSkills = async (force = false): Promise<SkillItem[]> => {
    const locale = cmsLocale.value
    if (!force && skills.value.length && skillsLocale.value === locale) {
      return skills.value
    }

    if (!force && skillsInflight && skillsInflightLocale === locale) {
      return skillsInflight
    }

    skillsInflightLocale = locale
    skillsInflight = (async () => {
      try {
        const response = await request<{ data: SkillItem[] }>(
          `/skills?locale=${encodeURIComponent(locale)}`,
        )
        const list = normalizeSkills(response?.data ?? response)
        skills.value = list
        skillsLocale.value = locale
        return list
      } catch (e) {
        console.warn('Could not load skills', e)
        if (!skills.value.length) skills.value = []
        return skills.value
      } finally {
        skillsInflight = null
        skillsInflightLocale = null
      }
    })()

    return skillsInflight
  }

  const labelBySlug = computed(() => {
    const map: Record<string, string> = {}
    for (const skill of skills.value) {
      map[skill.slug] = skill.name
    }
    return map
  })

  return {
    skills,
    labelBySlug,
    loadSkills,
  }
}
