import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { ActData } from '@/types'
import { formatMoney, formatDate } from '@/lib/documents/calculations'
import { amountToWords } from '@/lib/documents/number-to-words'

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
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  partyBlock: {
    marginBottom: 8,
  },
  partyLabel: {
    fontWeight: 700,
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
  },
  totalValue: {
    width: 100,
    textAlign: 'right',
    fontWeight: 700,
  },
  amountWords: {
    marginTop: 10,
    fontWeight: 700,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureLabel: {
    fontWeight: 700,
    marginBottom: 5,
    textAlign: 'center',
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
  actText: {
    marginTop: 15,
    lineHeight: 1.6,
  },
})

export function ActPDF({ data }: { data: ActData }) {
  const hasContract = data.contractNumber && data.contractDate

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          Акт № {data.number} от {formatDate(data.date)}
        </Text>
        {hasContract && (
          <Text style={styles.subtitle}>
            к Договору № {data.contractNumber} от {formatDate(data.contractDate!)}
          </Text>
        )}

        {/* Стороны */}
        <View style={styles.partyBlock}>
          <Text>
            <Text style={styles.partyLabel}>Исполнитель: </Text>
            <Text>
              {data.supplier.name}, ИНН {data.supplier.inn}
              {data.supplier.kpp ? `, КПП ${data.supplier.kpp}` : ''}
              {data.supplier.address ? `, ${data.supplier.address}` : ''}
            </Text>
          </Text>
        </View>
        <View style={styles.partyBlock}>
          <Text>
            <Text style={styles.partyLabel}>Заказчик: </Text>
            <Text>
              {data.buyer.name}, ИНН {data.buyer.inn}
              {data.buyer.kpp ? `, КПП ${data.buyer.kpp}` : ''}
              {data.buyer.address ? `, ${data.buyer.address}` : ''}
            </Text>
          </Text>
        </View>

        {/* Текст акта */}
        <View style={styles.actText}>
          <Text>
            Исполнитель сдал, а Заказчик принял следующие работы/услуги:
          </Text>
        </View>

        {/* Таблица */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.cellNum, ...styles.headerText }}>№</Text>
            <Text style={{ ...styles.cellName, ...styles.headerText }}>Наименование работ/услуг</Text>
            <Text style={{ ...styles.cellUnit, ...styles.headerText }}>Ед.</Text>
            <Text style={{ ...styles.cellQty, ...styles.headerText }}>Кол-во</Text>
            <Text style={{ ...styles.cellPrice, ...styles.headerText }}>Цена</Text>
            <Text style={{ ...styles.cellAmount, ...styles.headerText }}>Сумма</Text>
          </View>
          {data.items.map((item, i) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.cellNum}>{i + 1}</Text>
              <Text style={styles.cellName}>{item.name}</Text>
              <Text style={styles.cellUnit}>{item.unit}</Text>
              <Text style={styles.cellQty}>{item.quantity}</Text>
              <Text style={styles.cellPrice}>{formatMoney(item.price)}</Text>
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
            <Text style={styles.totalLabel}>Всего:</Text>
            <Text style={styles.totalValue}>{formatMoney(data.grandTotal)}</Text>
          </View>
        </View>

        <Text style={styles.amountWords}>
          Всего оказано услуг на сумму: {amountToWords(data.grandTotal)}
        </Text>

        <View style={styles.actText}>
          <Text>
            Вышеперечисленные работы (услуги) выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.
          </Text>
        </View>

        {/* Подписи */}
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Исполнитель</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {data.supplier.directorTitle || ''} / {data.supplier.directorName || ''}
            </Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Заказчик</Text>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>
              {data.buyer.directorTitle || ''} / {data.buyer.directorName || ''}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
