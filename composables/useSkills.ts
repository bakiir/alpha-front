export interface SkillItem {
  id: number
  slug: string
  name: string
  sort_order: number
}

let skillsInflight: Promise<SkillItem[]> | null = null

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
  const skills = useState<SkillItem[]>('catalog-skills', () => [])

  const loadSkills = async (force = false): Promise<SkillItem[]> => {
    if (!force && skills.value.length) {
      return skills.value
    }

    if (!force && skillsInflight) {
      return skillsInflight
    }

    skillsInflight = (async () => {
      try {
        const response = await request<{ data: SkillItem[] }>('/skills')
        const list = normalizeSkills(response?.data ?? response)
        skills.value = list
        return list
      } catch (e) {
        console.warn('Could not load skills', e)
        if (!skills.value.length) skills.value = []
        return skills.value
      } finally {
        skillsInflight = null
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
