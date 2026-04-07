export interface Profile {
  id: string
  name: string
  email: string
  role: 'master' | 'user'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type ContentType = 'pdf' | 'video' | 'link' | 'site'

export type Visibility = 'all' | 'master'

export interface Material {
  id: string
  title: string
  description: string | null
  category: 'estudo' | 'venda'
  type: 'pdf' | 'video' | 'link' | 'site'
  visibility: Visibility
  created_by: string | null
  created_at: string
  updated_at: string
  material_links?: MaterialLink[]
}

export interface MaterialLink {
  id: string
  material_id: string
  label: string
  url: string
  type: 'pdf' | 'video' | 'link' | 'site'
  sort_order: number
  created_at: string
}

export interface MaterialFormData {
  title: string
  description: string
  category: 'estudo' | 'venda'
  visibility: Visibility
  links: { label: string; url: string; type: ContentType }[]
}

export interface MaterialView {
  material_id: string
  viewed_at: string
}

export type ViewStatus = 'new' | 'updated' | 'viewed'
