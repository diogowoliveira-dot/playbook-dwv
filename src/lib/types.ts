export interface Profile {
  id: string
  name: string
  email: string
  role: 'master' | 'user'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Material {
  id: string
  title: string
  description: string | null
  category: 'estudo' | 'venda'
  type: 'pdf' | 'video' | 'link'
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
  sort_order: number
  created_at: string
}

export interface MaterialFormData {
  title: string
  description: string
  category: 'estudo' | 'venda'
  type: 'pdf' | 'video' | 'link'
  links: { label: string; url: string }[]
}
