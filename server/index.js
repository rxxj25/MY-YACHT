import 'dotenv/config'
import express from 'express'
import { Pool } from 'pg'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const port = Number(process.env.API_PORT ?? 5175)
const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url)

app.use(express.json({ limit: '64kb' }))

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    })
  : null

let schemaReady = null

async function ensureDatabase() {
  if (!pool) {
    const error = new Error('DATABASE_URL is not set. Add it to .env to enable PostgreSQL contact storage.')
    error.statusCode = 503
    throw error
  }

  schemaReady ??= readFile(join(__dirname, 'schema.sql'), 'utf8').then((schema) => pool.query(schema))
  await schemaReady
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim().slice(0, 5000) : ''
}

function cleanEnquiry(body) {
  return {
    fullName: cleanString(body.fullName),
    email: cleanString(body.email),
    telephone: cleanString(body.telephone),
    interest: cleanString(body.interest),
    message: cleanString(body.message),
    sourcePath: cleanString(body.sourcePath),
  }
}

async function upsertEnquiry({ id, data, status, userAgent }) {
  const submittedAtExpression = status === 'submitted' ? 'NOW()' : 'NULL'
  const result = await pool.query(
    `
      INSERT INTO contact_enquiries (
        id, full_name, email, telephone, interest, message, status, source_path, user_agent, submitted_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ${submittedAtExpression})
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        telephone = EXCLUDED.telephone,
        interest = EXCLUDED.interest,
        message = EXCLUDED.message,
        status = EXCLUDED.status,
        source_path = EXCLUDED.source_path,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW(),
        submitted_at = CASE
          WHEN EXCLUDED.status = 'submitted' THEN NOW()
          ELSE contact_enquiries.submitted_at
        END
      RETURNING
        id,
        full_name AS "fullName",
        email,
        telephone,
        interest,
        message,
        status,
        source_path AS "sourcePath",
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        submitted_at AS "submittedAt"
    `,
    [
      id,
      data.fullName,
      data.email,
      data.telephone,
      data.interest,
      data.message,
      status,
      data.sourcePath,
      userAgent,
    ],
  )

  return result.rows[0]
}

app.get('/api/health', async (_request, response) => {
  try {
    await ensureDatabase()
    response.json({ ok: true, database: 'connected' })
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ ok: false, error: error.message })
  }
})

app.put('/api/contact-enquiries/:id', async (request, response) => {
  try {
    await ensureDatabase()
    const row = await upsertEnquiry({
      id: request.params.id,
      data: cleanEnquiry(request.body),
      status: 'draft',
      userAgent: request.get('user-agent') ?? '',
    })
    response.json({ ok: true, enquiry: row })
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ ok: false, error: error.message })
  }
})

app.post('/api/contact-enquiries/:id/submit', async (request, response) => {
  try {
    await ensureDatabase()
    const data = cleanEnquiry(request.body)

    if (!data.fullName || !data.email || !data.message) {
      return response.status(400).json({
        ok: false,
        error: 'Full name, email address, and message are required.',
      })
    }

    const row = await upsertEnquiry({
      id: request.params.id,
      data,
      status: 'submitted',
      userAgent: request.get('user-agent') ?? '',
    })
    response.json({ ok: true, enquiry: row })
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ ok: false, error: error.message })
  }
})

app.get('/api/contact-enquiries/:id', async (request, response) => {
  try {
    await ensureDatabase()
    const result = await pool.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          telephone,
          interest,
          message,
          status,
          source_path AS "sourcePath",
          created_at AS "createdAt",
          updated_at AS "updatedAt",
          submitted_at AS "submittedAt"
        FROM contact_enquiries
        WHERE id = $1
      `,
      [request.params.id],
    )

    if (!result.rowCount) return response.status(404).json({ ok: false, error: 'Enquiry not found.' })
    response.json({ ok: true, enquiry: result.rows[0] })
  } catch (error) {
    response.status(error.statusCode ?? 500).json({ ok: false, error: error.message })
  }
})

if (isDirectRun) {
  app.listen(port, () => {
    console.log(`Contact API listening on http://127.0.0.1:${port}`)
  })
}

export default app
