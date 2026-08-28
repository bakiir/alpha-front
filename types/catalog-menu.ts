export interface CatalogMenuItem {
  name: string
  slug: string
  category?: string
  search?: string
}

export interface CatalogMenuGroup {
  title: string
  items: CatalogMenuItem[]
}

export interface CatalogMenuSection {
  id: string
  name: string
  icon: string
  title: string
  groups: CatalogMenuGroup[]
}
