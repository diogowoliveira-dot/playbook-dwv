import { createClient } from '@supabase/supabase-js'

const url = 'https://xvsdfahzbubscxbulbnc.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2c2RmYWh6YnVic2N4YnVsYm5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjU2NzE4MSwiZXhwIjoyMDg4MTQzMTgxfQ.LEYOQ38LPjzE8XVaG3zfGqTShNsT4XwoTJIhZ3j2NsU'

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('=== Setup Playbook DWV Database ===\n')

  // 1. Check if tables exist by trying to query
  console.log('1. Checking existing tables...')

  const { error: profErr } = await supabase.from('profiles').select('id').limit(1)
  const profilesExist = !profErr || !profErr.message.includes('does not exist')

  const { error: matErr } = await supabase.from('materials').select('id').limit(1)
  const materialsExist = !matErr || !matErr.message.includes('does not exist')

  const { error: linkErr } = await supabase.from('material_links').select('id').limit(1)
  const linksExist = !linkErr || !linkErr.message.includes('does not exist')

  console.log(`  profiles: ${profilesExist ? 'EXISTS' : 'MISSING'}`)
  console.log(`  materials: ${materialsExist ? 'EXISTS' : 'MISSING'}`)
  console.log(`  material_links: ${linksExist ? 'EXISTS' : 'MISSING'}`)

  if (!profilesExist || !materialsExist || !linksExist) {
    console.log('\n⚠️  Tabelas nao encontradas!')
    console.log('   Voce precisa executar o schema.sql manualmente no Supabase SQL Editor.')
    console.log('   Abra: https://supabase.com/dashboard/project/xvsdfahzbubscxbulbnc/sql/new')
    console.log('   Cole o conteudo de supabase/schema.sql e execute (F5)')
    console.log('')
  }

  // 2. Check/create master user
  console.log('2. Checking master user...')

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const masterEmail = 'admin@dwv.com.br'
  const existingMaster = existingUsers?.users?.find(u => u.email === masterEmail)

  if (existingMaster) {
    console.log(`  Master user already exists: ${existingMaster.id}`)

    // Check if profile exists
    if (profilesExist) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', existingMaster.id)
        .single()

      if (profile) {
        console.log(`  Profile: ${profile.name} (${profile.role})`)
        if (profile.role !== 'master') {
          console.log('  Updating role to master...')
          await supabase.from('profiles').update({ role: 'master' }).eq('id', existingMaster.id)
          console.log('  Done!')
        }
      } else {
        console.log('  Creating profile for master...')
        await supabase.from('profiles').insert({
          id: existingMaster.id,
          name: 'Admin DWV',
          email: masterEmail,
          role: 'master'
        })
        console.log('  Done!')
      }
    }
  } else {
    console.log('  Creating master user...')
    const { data, error } = await supabase.auth.admin.createUser({
      email: masterEmail,
      password: 'dwv2025master',
      email_confirm: true,
      user_metadata: { name: 'Admin DWV', role: 'master' }
    })
    if (error) {
      console.log(`  Error: ${error.message}`)
    } else {
      console.log(`  Created: ${data.user.id}`)
      console.log(`  Email: ${masterEmail}`)
      console.log(`  Password: dwv2025master`)
    }
  }

  // 3. Check seed data
  if (materialsExist) {
    console.log('\n3. Checking seed data...')
    const { data: materials, error: seedErr } = await supabase.from('materials').select('id')
    if (seedErr) {
      console.log(`  Error: ${seedErr.message}`)
    } else {
      console.log(`  Materials count: ${materials?.length || 0}`)
      if ((materials?.length || 0) === 0) {
        console.log('  ⚠️  No materials found. Seed data needs to be inserted via SQL Editor.')
      }
    }
  }

  console.log('\n=== Done! ===')
}

run().catch(console.error)
