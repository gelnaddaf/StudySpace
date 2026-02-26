import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api')

app.use('*', cors())

// ──────────────────────────────────────────────
// NOTES
// ──────────────────────────────────────────────

// List all notes with their linked LO IDs
app.get('/notes', async (c) => {
  const db = c.env.DB
  const notes = await db.prepare(
    'SELECT id, title, content, created_at, updated_at FROM notes ORDER BY updated_at DESC'
  ).all()

  const links = await db.prepare('SELECT note_id, lo_id FROM note_lo_links').all()
  const linkMap = new Map<string, string[]>()
  for (const link of links.results) {
    const l = link as { note_id: string; lo_id: string }
    if (!linkMap.has(l.note_id)) linkMap.set(l.note_id, [])
    linkMap.get(l.note_id)!.push(l.lo_id)
  }

  const result = notes.results.map((n: any) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    linkedLOs: linkMap.get(n.id) || [],
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  }))

  return c.json(result)
})

// Create a note
app.post('/notes', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ title: string; content: string; linkedLOs?: string[] }>()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.prepare(
    'INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.title, body.content || '', now, now).run()

  if (body.linkedLOs?.length) {
    const stmt = db.prepare('INSERT INTO note_lo_links (note_id, lo_id) VALUES (?, ?)')
    await db.batch(body.linkedLOs.map(loId => stmt.bind(id, loId)))
  }

  return c.json({ id, title: body.title, content: body.content || '', linkedLOs: body.linkedLOs || [], createdAt: now, updatedAt: now }, 201)
})

// Update a note
app.put('/notes/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  const body = await c.req.json<{ title?: string; content?: string; linkedLOs?: string[] }>()
  const now = new Date().toISOString()

  const existing = await db.prepare('SELECT id FROM notes WHERE id = ?').bind(id).first()
  if (!existing) return c.json({ error: 'Note not found' }, 404)

  if (body.title !== undefined || body.content !== undefined) {
    const sets: string[] = ['updated_at = ?']
    const vals: any[] = [now]
    if (body.title !== undefined) { sets.push('title = ?'); vals.push(body.title) }
    if (body.content !== undefined) { sets.push('content = ?'); vals.push(body.content) }
    vals.push(id)
    await db.prepare(`UPDATE notes SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run()
  }

  if (body.linkedLOs !== undefined) {
    await db.prepare('DELETE FROM note_lo_links WHERE note_id = ?').bind(id).run()
    if (body.linkedLOs.length > 0) {
      const stmt = db.prepare('INSERT INTO note_lo_links (note_id, lo_id) VALUES (?, ?)')
      await db.batch(body.linkedLOs.map(loId => stmt.bind(id, loId)))
    }
  }

  return c.json({ success: true, updatedAt: now })
})

// Delete a note
app.delete('/notes/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ──────────────────────────────────────────────
// LEARNING OUTCOMES
// ──────────────────────────────────────────────

// List all LOs with linked note IDs
app.get('/learning-outcomes', async (c) => {
  const db = c.env.DB
  const outcomes = await db.prepare(
    'SELECT id, code, description, subject_name, created_at FROM learning_outcomes ORDER BY code ASC'
  ).all()

  const links = await db.prepare('SELECT note_id, lo_id FROM note_lo_links').all()
  const linkMap = new Map<string, string[]>()
  for (const link of links.results) {
    const l = link as { note_id: string; lo_id: string }
    if (!linkMap.has(l.lo_id)) linkMap.set(l.lo_id, [])
    linkMap.get(l.lo_id)!.push(l.note_id)
  }

  const result = outcomes.results.map((lo: any) => ({
    id: lo.id,
    code: lo.code,
    description: lo.description,
    subjectName: lo.subject_name,
    linkedNoteIds: linkMap.get(lo.id) || [],
    createdAt: lo.created_at,
  }))

  return c.json(result)
})

// Create an LO
app.post('/learning-outcomes', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ code: string; description: string; subjectName: string }>()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.prepare(
    'INSERT INTO learning_outcomes (id, code, description, subject_name, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.code, body.description, body.subjectName || '', now).run()

  return c.json({ id, code: body.code, description: body.description, subjectName: body.subjectName || '', linkedNoteIds: [], createdAt: now }, 201)
})

// Bulk import LOs
app.post('/learning-outcomes/import', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ items: { code: string; description: string; subjectName: string }[] }>()
  const now = new Date().toISOString()

  const stmt = db.prepare(
    'INSERT INTO learning_outcomes (id, code, description, subject_name, created_at) VALUES (?, ?, ?, ?, ?)'
  )
  const newLOs = body.items.map(item => {
    const id = crypto.randomUUID()
    return { stmt: stmt.bind(id, item.code, item.description, item.subjectName || '', now), lo: { id, code: item.code, description: item.description, subjectName: item.subjectName || '', linkedNoteIds: [], createdAt: now } }
  })

  await db.batch(newLOs.map(l => l.stmt))
  return c.json(newLOs.map(l => l.lo), 201)
})

// Delete an LO
app.delete('/learning-outcomes/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM learning_outcomes WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// Export as Cloudflare Pages Function
// Pages Functions receive a context object, not raw (request, env, ctx)
export const onRequest: PagesFunction<{ DB: D1Database }> = async (context) => {
  return app.fetch(context.request, context.env, context)
}
