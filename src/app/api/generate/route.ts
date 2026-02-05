import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePDF } from '@/lib/pdf/invoice-pdf'
import { ActPDF } from '@/lib/pdf/act-pdf'
import { ContractPDF } from '@/lib/pdf/contract-pdf'
import type { InvoiceData, ActData, ContractData } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let element: React.ReactElement<any>
    let filename: string

    switch (type) {
      case 'invoice': {
        const invoiceData = data as InvoiceData
        element = React.createElement(InvoicePDF, { data: invoiceData })
        filename = `Счёт_${invoiceData.number}_${invoiceData.date}.pdf`
        break
      }

      case 'act': {
        const actData = data as ActData
        element = React.createElement(ActPDF, { data: actData })
        filename = `Акт_${actData.number}_${actData.date}.pdf`
        break
      }

      case 'contract': {
        const contractData = data as ContractData
        element = React.createElement(ContractPDF, { data: contractData })
        filename = `Договор_${contractData.number}_${contractData.date}.pdf`
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
    }

    const pdfBuffer = await renderToBuffer(element)
    const uint8 = new Uint8Array(pdfBuffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
