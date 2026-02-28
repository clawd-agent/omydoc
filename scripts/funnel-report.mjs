#!/usr/bin/env node
import fs from 'node:fs'
import { buildFunnelReport } from '../src/lib/analytics/funnel-report.ts'

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node scripts/funnel-report.mjs <input.json>')
  process.exit(1)
}

const raw = fs.readFileSync(inputPath, 'utf8')
const data = JSON.parse(raw)
const report = buildFunnelReport(data.funnel || data, data.validationErrors)

for (const item of report) {
  console.log(`\n=== ${item.docType.toUpperCase()} ===`)
  console.log(`starts=${item.counts.form_start}, company_filled=${item.counts.company_filled}, generated=${item.counts.pdf_generated}, downloaded=${item.counts.pdf_downloaded}, abandon=${item.counts.form_abandon}`)
  for (const s of item.stages) {
    console.log(`${s.from} -> ${s.to}: conversion=${s.conversion}% dropoff=${s.dropoff}%`)
  }
  if (item.validationErrors) {
    console.log(`validation_error: supplier=${item.validationErrors.supplier}, buyer=${item.validationErrors.buyer}, items=${item.validationErrors.items}, subject=${item.validationErrors.subject}, endDate=${item.validationErrors.endDate}`)
  }
}
