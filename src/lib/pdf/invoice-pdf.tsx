import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { InvoiceData } from '@/types'
import { formatMoney, formatDate } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'

// Регистрация кириллического шрифта
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    padding: 40,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 10,
  },
  bankDetails: {
    border: '1pt solid #000',
    marginBottom: 15,
  },
  bankRow: {
    flexDirection: 'row',
    borderBottom: '1pt solid #000',
  },
  bankLabel: {
    width: 100,
    padding: '3 5',
    fontSize: 7,
    color: '#666',
  },
  bankValue: {
    flex: 1,
    padding: '3 5',
    fontSize: 9,
  },
  bankRight: {
    width: 200,
    borderLeft: '1pt solid #000',
    padding: '3 5',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 15,
    color: '#666',
  },
  partyBlock: {
    marginBottom: 8,
  },
  partyLabel: {
    fontWeight: 700,
    fontSize: 9,
  },
  partyValue: {
    fontSize: 9,
  },
  table: {
    marginTop: 15,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1pt solid #000',
    borderTop: '1pt solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
  },
  cellNum: { width: 25, padding: '4 3', textAlign: 'center', borderRight: '0.5pt solid #ccc' },
  cellName: { flex: 1, padding: '4 3', borderRight: '0.5pt solid #ccc' },
  cellUnit: { width: 35, padding: '4 3', textAlign: 'center', borderRight: '0.5pt solid #ccc' },
  cellQty: { width: 45, padding: '4 3', textAlign: 'center', borderRight: '0.5pt solid #ccc' },
  cellPrice: { width: 70, padding: '4 3', textAlign: 'right', borderRight: '0.5pt solid #ccc' },
  cellVat: { width: 60, padding: '4 3', textAlign: 'right', borderRight: '0.5pt solid #ccc' },
  cellAmount: { width: 80, padding: '4 3', textAlign: 'right' },
  headerText: {
    fontWeight: 700,
    fontSize: 8,
  },
  totals: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  totalLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 10,
    fontSize: 9,
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 700,
    fontSize: 9,
  },
  amountWords: {
    marginTop: 10,
    fontSize: 9,
    fontWeight: 700,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 5,
  },
  signatureLine: {
    borderBottom: '1pt solid #000',
    height: 20,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 8,
    textAlign: 'center',
    color: '#666',
  },
})

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const vatDisplay = (rate: number) => rate === 0 ? 'Без НДС' : `${rate}%`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Банковские реквизиты поставщика */}
        <View style={styles.bankDetails}>
          <View style={styles.bankRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Банк получателя</Text>
                <Text style={styles.bankValue}>{data.supplier.bankName || ''}</Text>
              </View>
            </View>
            <View style={styles.bankRight}>
              <Text style={{ fontSize: 7, color: '#666' }}>БИК</Text>
              <Text style={{ fontSize: 9 }}>{data.supplier.bik || ''}</Text>
            </View>
          </View>
          <View style={styles.bankRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>ИНН {data.supplier.inn}</Text>
                <Text style={styles.bankValue}>
                  КПП {data.supplier.kpp || '—'}
                </Text>
              </View>
              <View style={{ ...styles.bankRow, borderBottom: 'none' }}>
                <Text style={styles.bankLabel}>Получатель</Text>
                <Text style={styles.bankValue}>{data.supplier.shortName || data.supplier.name}</Text>
              </View>
            </View>
            <View style={styles.bankRight}>
              <Text style={{ fontSize: 7, color: '#666' }}>Сч. №</Text>
              <Text style={{ fontSize: 9 }}>{data.supplier.accountNumber || ''}</Text>
              <Text style={{ fontSize: 7, color: '#666', marginTop: 5 }}>Кор. сч.</Text>
              <Text style={{ fontSize: 9 }}>{data.supplier.corrAccount || ''}</Text>
            </View>
          </View>
        </View>

        {/* Заголовок */}
        <Text style={styles.title}>
          Счёт на оплату № {data.number} от {formatDate(data.date)}
        </Text>

        {/* Поставщик и Покупатель */}
        <View style={styles.partyBlock}>
          <Text>
            <Text style={styles.partyLabel}>Поставщик: </Text>
            <Text style={styles.partyValue}>
              {data.supplier.name}, ИНН {data.supplier.inn}
              {data.supplier.kpp ? `, КПП ${data.supplier.kpp}` : ''}
              {data.supplier.address ? `, ${data.supplier.address}` : ''}
            </Text>
          </Text>
        </View>
        <View style={styles.partyBlock}>
          <Text>
            <Text style={styles.partyLabel}>Покупатель: </Text>
            <Text style={styles.partyValue}>
              {data.buyer.name}, ИНН {data.buyer.inn}
              {data.buyer.kpp ? `, КПП ${data.buyer.kpp}` : ''}
              {data.buyer.address ? `, ${data.buyer.address}` : ''}
            </Text>
          </Text>
        </View>

        {/* Таблица позиций */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.cellNum, ...styles.headerText }}>№</Text>
            <Text style={{ ...styles.cellName, ...styles.headerText }}>Наименование</Text>
            <Text style={{ ...styles.cellUnit, ...styles.headerText }}>Ед.</Text>
            <Text style={{ ...styles.cellQty, ...styles.headerText }}>Кол-во</Text>
            <Text style={{ ...styles.cellPrice, ...styles.headerText }}>Цена</Text>
            <Text style={{ ...styles.cellVat, ...styles.headerText }}>НДС</Text>
            <Text style={{ ...styles.cellAmount, ...styles.headerText }}>Сумма</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.cellNum}>{i + 1}</Text>
              <Text style={styles.cellName}>{item.name}</Text>
              <Text style={styles.cellUnit}>{item.unit}</Text>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellPrice}>{formatMoney(item.price)}</Text>
              <Text style={styles.cellVat}>
                {item.vatRate === 0 ? 'Без НДС' : `${formatMoney(item.vatAmount)} (${item.vatRate}%)`}
              </Text>
              <Text style={styles.cellAmount}>{formatMoney(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        {/* Итого */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Итого:</Text>
            <Text style={styles.totalValue}>{formatMoney(data.totalAmount)}</Text>
          </View>
          {data.totalVat > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>В том числе НДС:</Text>
              <Text style={styles.totalValue}>{formatMoney(data.totalVat)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Всего к оплате:</Text>
            <Text style={styles.totalValue}>{formatMoney(data.grandTotal)}</Text>
          </View>
        </View>

        {/* Сумма прописью */}
        <Text style={styles.amountWords}>
          Всего наименований {data.items.length}, на сумму {formatMoney(data.grandTotal)} руб.
        </Text>
        <Text style={{ fontSize: 9, fontWeight: 700 }}>
          {amountToWords(data.grandTotal)}
        </Text>

        {data.notes && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: 8, color: '#666' }}>Примечание: {data.notes}</Text>
          </View>
        )}

        {/* Подписи */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Руководитель</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {data.supplier.directorName || ''}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Бухгалтер</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  )
}
