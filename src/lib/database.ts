import { supabase } from './supabase-client'
import type { Profile, Material, MaterialLink } from './types'

// ── Auth ──
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, role: 'user' } },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  return data
}

// ── Profiles ──
export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ── Materials ──
export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*, material_links(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createMaterial(
  title: string,
  description: string,
  category: string,
  type: string,
  createdBy: string,
  links: { label: string; url: string }[]
) {
  const { data: material, error } = await supabase
    .from('materials')
    .insert({ title, description, category, type, created_by: createdBy })
    .select()
    .single()
  if (error) throw error

  if (links.length > 0) {
    const linkRows = links.map((l, i) => ({
      material_id: material.id,
      label: l.label,
      url: l.url,
      sort_order: i,
    }))
    const { error: linkErr } = await supabase.from('material_links').insert(linkRows)
    if (linkErr) throw linkErr
  }

  return material
}

export async function updateMaterial(
  id: string,
  title: string,
  description: string,
  category: string,
  type: string,
  links: { label: string; url: string }[]
) {
  const { error } = await supabase
    .from('materials')
    .update({ title, description, category, type })
    .eq('id', id)
  if (error) throw error

  // Replace links
  await supabase.from('material_links').delete().eq('material_id', id)
  if (links.length > 0) {
    const linkRows = links.map((l, i) => ({
      material_id: id,
      label: l.label,
      url: l.url,
      sort_order: i,
    }))
    const { error: linkErr } = await supabase.from('material_links').insert(linkRows)
    if (linkErr) throw linkErr
  }
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}
