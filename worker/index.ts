import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database
  BUCKET: R2Bucket
  AI: Ai
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())

// ──────────────────────────────────────────────
// NOTES
// ──────────────────────────────────────────────

app.get('/api/notes', async (c) => {
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

app.post('/api/notes', async (c) => {
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

app.put('/api/notes/:id', async (c) => {
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

app.delete('/api/notes/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ──────────────────────────────────────────────
// LEARNING OUTCOMES
// ──────────────────────────────────────────────

app.get('/api/learning-outcomes', async (c) => {
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

app.post('/api/learning-outcomes', async (c) => {
  const db = c.env.DB
  const body = await c.req.json<{ code: string; description: string; subjectName: string }>()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.prepare(
    'INSERT INTO learning_outcomes (id, code, description, subject_name, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, body.code, body.description, body.subjectName || '', now).run()

  return c.json({ id, code: body.code, description: body.description, subjectName: body.subjectName || '', linkedNoteIds: [], createdAt: now }, 201)
})

app.post('/api/learning-outcomes/import', async (c) => {
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

app.delete('/api/learning-outcomes/:id', async (c) => {
  const db = c.env.DB
  const id = c.req.param('id')
  await db.prepare('DELETE FROM learning_outcomes WHERE id = ?').bind(id).run()
  return c.json({ success: true })
})

// ──────────────────────────────────────────────
// FILES (R2)
// ──────────────────────────────────────────────

app.get('/api/notes/:noteId/files', async (c) => {
  const db = c.env.DB
  const noteId = c.req.param('noteId')
  const files = await db.prepare(
    'SELECT id, note_id, filename, content_type, size_bytes, r2_key, created_at FROM files WHERE note_id = ? ORDER BY created_at DESC'
  ).bind(noteId).all()

  return c.json(files.results.map((f: any) => ({
    id: f.id, noteId: f.note_id, filename: f.filename,
    contentType: f.content_type, sizeBytes: f.size_bytes,
    r2Key: f.r2_key, createdAt: f.created_at,
  })))
})

app.post('/api/notes/:noteId/files', async (c) => {
  const db = c.env.DB
  const bucket = c.env.BUCKET
  const noteId = c.req.param('noteId')

  const formData = await c.req.formData()
  const file = formData.get('file') as File | null
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const id = crypto.randomUUID()
  const r2Key = `notes/${noteId}/${id}-${file.name}`
  const now = new Date().toISOString()

  await bucket.put(r2Key, file.stream(), {
    httpMetadata: { contentType: file.type },
  })

  await db.prepare(
    'INSERT INTO files (id, note_id, filename, content_type, size_bytes, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, noteId, file.name, file.type, file.size, r2Key, now).run()

  return c.json({ id, noteId, filename: file.name, contentType: file.type, sizeBytes: file.size, r2Key, createdAt: now }, 201)
})

app.get('/api/files/:id/download', async (c) => {
  const db = c.env.DB
  const bucket = c.env.BUCKET
  const id = c.req.param('id')

  const fileMeta = await db.prepare('SELECT r2_key, filename, content_type FROM files WHERE id = ?').bind(id).first() as any
  if (!fileMeta) return c.json({ error: 'File not found' }, 404)

  const obj = await bucket.get(fileMeta.r2_key)
  if (!obj) return c.json({ error: 'File not found in storage' }, 404)

  return new Response(obj.body, {
    headers: {
      'Content-Type': fileMeta.content_type,
      'Content-Disposition': `inline; filename="${fileMeta.filename}"`,
    },
  })
})

app.delete('/api/files/:id', async (c) => {
  const db = c.env.DB
  const bucket = c.env.BUCKET
  const id = c.req.param('id')

  const fileMeta = await db.prepare('SELECT r2_key FROM files WHERE id = ?').bind(id).first() as any
  if (fileMeta) {
    await bucket.delete(fileMeta.r2_key)
    await db.prepare('DELETE FROM files WHERE id = ?').bind(id).run()
  }
  return c.json({ success: true })
})

// ──────────────────────────────────────────────
// AI (Workers AI)
// ──────────────────────────────────────────────

app.post('/api/ai/extract-los', async (c) => {
  const ai = c.env.AI
  const body = await c.req.json<{ text: string; subjectName?: string }>()

  const prompt = `You are an educational assistant. Extract learning outcomes from the following text.
Return a JSON array of objects with "code" and "description" fields.
Code format: LO1, LO2, etc. Keep descriptions concise (1-2 sentences).
Only return the JSON array, no other text.

Text:
${body.text.slice(0, 4000)}`

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  }) as any

  try {
    const text = result.response || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const los = JSON.parse(jsonMatch[0])
      return c.json(los.map((lo: any) => ({
        code: lo.code || '',
        description: lo.description || '',
        subjectName: body.subjectName || '',
      })))
    }
    return c.json([])
  } catch {
    return c.json([])
  }
})

app.post('/api/ai/suggest-links', async (c) => {
  const ai = c.env.AI
  const db = c.env.DB

  const notes = await db.prepare('SELECT id, title, content FROM notes').all()
  const outcomes = await db.prepare('SELECT id, code, description FROM learning_outcomes').all()
  const existingLinks = await db.prepare('SELECT note_id, lo_id FROM note_lo_links').all()

  const existingSet = new Set(existingLinks.results.map((l: any) => `${l.note_id}::${l.lo_id}`))

  const notesSummary = notes.results.map((n: any) =>
    `[${n.id}] "${n.title}": ${(n.content || '').slice(0, 200)}`
  ).join('\n')

  const losSummary = outcomes.results.map((lo: any) =>
    `[${lo.id}] ${lo.code}: ${lo.description}`
  ).join('\n')

  const prompt = `You are an educational assistant. Match notes to learning outcomes they cover.
Return a JSON array of objects with "noteId", "loId", "confidence" (0-1), and "reason" (short explanation).
Only suggest strong matches (confidence > 0.6). Only return the JSON array, no other text.

Notes:
${notesSummary.slice(0, 2000)}

Learning Outcomes:
${losSummary.slice(0, 2000)}`

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  }) as any

  try {
    const text = result.response || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0])
      const noteMap = new Map(notes.results.map((n: any) => [n.id, n.title]))
      const loMap = new Map(outcomes.results.map((lo: any) => [lo.id, lo.code]))

      return c.json(suggestions
        .filter((s: any) => !existingSet.has(`${s.noteId}::${s.loId}`) && noteMap.has(s.noteId) && loMap.has(s.loId))
        .map((s: any) => ({
          noteId: s.noteId,
          noteTitle: noteMap.get(s.noteId) || '',
          loId: s.loId,
          loCode: loMap.get(s.loId) || '',
          confidence: s.confidence || 0.7,
          reason: s.reason || '',
        }))
      )
    }
    return c.json([])
  } catch {
    return c.json([])
  }
})

app.post('/api/ai/gap-analysis', async (c) => {
  const ai = c.env.AI
  const db = c.env.DB

  const outcomes = await db.prepare('SELECT id, code, description FROM learning_outcomes').all()
  const notes = await db.prepare('SELECT id, title, content FROM notes').all()
  const links = await db.prepare('SELECT note_id, lo_id FROM note_lo_links').all()

  const linkMap = new Map<string, string[]>()
  for (const l of links.results as any[]) {
    if (!linkMap.has(l.lo_id)) linkMap.set(l.lo_id, [])
    linkMap.get(l.lo_id)!.push(l.note_id)
  }

  const noteMap = new Map(notes.results.map((n: any) => [n.id, n.title]))

  const summary = outcomes.results.map((lo: any) => {
    const noteIds = linkMap.get(lo.id) || []
    const titles = noteIds.map(id => noteMap.get(id) || 'Unknown').join(', ')
    return `${lo.code} (${lo.description}): ${noteIds.length} notes${titles ? ' — ' + titles : ''}`
  }).join('\n')

  const prompt = `You are an educational study advisor. Analyze the student's study coverage and provide actionable feedback.
For each gap or weakness, suggest specific actions.
Return a JSON object with: "summary" (2-3 sentences), "gaps" (array of {"loCode", "suggestion"}), "strengths" (array of loCode strings).
Only return the JSON, no other text.

Coverage Data:
${summary.slice(0, 3000)}`

  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct' as any, {
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
  }) as any

  try {
    const text = result.response || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return c.json(JSON.parse(jsonMatch[0]))
    }
    return c.json({ summary: 'Unable to generate analysis.', gaps: [], strengths: [] })
  } catch {
    return c.json({ summary: 'Unable to generate analysis.', gaps: [], strengths: [] })
  }
})

// Default export for Cloudflare Workers
export default app
