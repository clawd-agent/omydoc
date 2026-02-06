import { NextRequest, NextResponse } from 'next/server'
import { findCompanyByInn, findBankByBik, suggestCompany, dadataToCompanyInfo, dadataToBankInfo } from '@/lib/dadata'

export async function POST(request: NextRequest) {
  try {
    const { type, query } = await request.json()

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    switch (type) {
      case 'company': {
        // Если query похож на ИНН (только цифры), ищем по ИНН
        const isInn = /^\d{10,12}$/.test(query.trim())
        const results = isInn
          ? await findCompanyByInn(query.trim())
          : await suggestCompany(query.trim())

        // DEBUG: Include raw data.name in response
        const rawName = results[0]?.data?.name
        const companies = results.map(dadataToCompanyInfo)
        return NextResponse.json({ suggestions: companies, _debug: { rawName } })
      }

      case 'bank': {
        const results = await findBankByBik(query.trim())
        const banks = results.map(dadataToBankInfo)
        return NextResponse.json({ suggestions: banks })
      }

      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
  } catch (error) {
    console.error('DaData API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}
