/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 60

import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePDF } from '@/lib/pdf/invoice-pdf'
import { ActPDF } from '@/lib/pdf/act-pdf'
import { ContractPDF } from '@/lib/pdf/contract-pdf'
import type { InvoiceData, ActData, ContractData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { contract, invoice, act } = await request.json() as {
      contract: ContractData
      invoice: InvoiceData
      act: ActData
    }

    if (!contract || !invoice || !act) {
      return NextResponse.json({ error: 'Missing package payload' }, { status: 400 })
    }

    const jobs: Array<{ filename: string; element: React.ReactElement<any> }> = [
      {
        filename: `Договор_${contract.number}_${contract.date}.pdf`,
        element: React.createElement(ContractPDF, { data: contract }) as React.ReactElement<any>,
      },
      {
        filename: `Счёт_${invoice.number}_${invoice.date}.pdf`,
        element: React.createElement(InvoicePDF, { data: invoice }) as React.ReactElement<any>,
      },
      {
        filename: `Акт_${act.number}_${act.date}.pdf`,
        element: React.createElement(ActPDF, { data: act }) as React.ReactElement<any>,
      },
    ]

    const zip = new JSZip()

    for (const job of jobs) {
      const pdfBuffer = await renderToBuffer(job.element)
      zip.file(job.filename, new Uint8Array(pdfBuffer))
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipUint8 = new Uint8Array(zipBuffer)

    return new NextResponse(zipUint8, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`Комплект_OmyDoc_${new Date().toISOString().slice(0, 10)}.zip`)}`,
      },
    })
  } catch (error) {
    console.error('Package generation error:', error)
    return NextResponse.json({ error: 'Failed to generate package' }, { status: 500 })
  }
}
