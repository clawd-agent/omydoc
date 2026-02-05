import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { ContractData } from '@/types'
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
    fontSize: 10,
    padding: 50,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 3,
  },
  dateCity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 6,
    textAlign: 'justify',
  },
  indent: {
    marginBottom: 6,
    textAlign: 'justify',
    paddingLeft: 20,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  signatureBlock: {
    width: '45%',
  },
  signatureTitle: {
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'center',
  },
  signatureDetail: {
    fontSize: 8,
    marginBottom: 2,
  },
  signatureLine: {
    borderBottom: '1pt solid #000',
    height: 25,
    marginTop: 15,
    marginBottom: 3,
  },
  signatureName: {
    fontSize: 9,
    textAlign: 'center',
  },
})

export function ContractPDF({ data }: { data: ContractData }) {
  const supplierTitle = data.supplier.directorTitle || 'Генеральный директор'
  const supplierName = data.supplier.directorName || '_______________'
  const buyerTitle = data.buyer.directorTitle || 'Генеральный директор'
  const buyerName = data.buyer.directorName || '_______________'

  const isSupplierIP = data.supplier.directorTitle?.includes('Индивидуальный предприниматель')
  const isBuyerIP = data.buyer.directorTitle?.includes('Индивидуальный предприниматель')

  const supplierActsOn = isSupplierIP
    ? `действующий на основании свидетельства о государственной регистрации`
    : `в лице ${supplierTitle}а ${supplierName}, действующего на основании Устава`

  const buyerActsOn = isBuyerIP
    ? `действующий на основании свидетельства о государственной регистрации`
    : `в лице ${buyerTitle}а ${buyerName}, действующего на основании Устава`

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>
          ДОГОВОР ОКАЗАНИЯ УСЛУГ № {data.number}
        </Text>

        <View style={styles.dateCity}>
          <Text>г. Москва</Text>
          <Text>{formatDate(data.date)}</Text>
        </View>

        {/* Преамбула */}
        <Text style={styles.paragraph}>
          {data.supplier.name}, именуем{isSupplierIP ? 'ый' : 'ое'} в дальнейшем «Исполнитель», {supplierActsOn}, с одной стороны, и {data.buyer.name}, именуем{isBuyerIP ? 'ый' : 'ое'} в дальнейшем «Заказчик», {buyerActsOn}, с другой стороны, совместно именуемые «Стороны», заключили настоящий Договор о нижеследующем:
        </Text>

        {/* 1. Предмет договора */}
        <Text style={styles.sectionTitle}>1. ПРЕДМЕТ ДОГОВОРА</Text>
        <Text style={styles.paragraph}>
          1.1. Исполнитель обязуется по заданию Заказчика оказать следующие услуги (далее — «Услуги»): {data.subject}
        </Text>
        <Text style={styles.paragraph}>
          1.2. Срок оказания Услуг: с {formatDate(data.startDate)} по {formatDate(data.endDate)}.
        </Text>

        {/* 2. Стоимость и порядок расчётов */}
        <Text style={styles.sectionTitle}>2. СТОИМОСТЬ УСЛУГ И ПОРЯДОК РАСЧЁТОВ</Text>
        <Text style={styles.paragraph}>
          2.1. Стоимость Услуг по настоящему Договору составляет {formatMoney(data.grandTotal)} ({amountToWords(data.grandTotal)})
          {data.totalVat > 0 ? `, в том числе НДС ${formatMoney(data.totalVat)} руб.` : ', НДС не облагается'}.
        </Text>
        <Text style={styles.paragraph}>
          2.2. {data.paymentTerms || `Оплата производится Заказчиком в течение ${data.paymentDays || 5} (${numberWord(data.paymentDays || 5)}) рабочих дней с момента подписания акта оказанных услуг путём перечисления денежных средств на расчётный счёт Исполнителя.`}
        </Text>

        {/* 3. Обязанности сторон */}
        <Text style={styles.sectionTitle}>3. ОБЯЗАННОСТИ СТОРОН</Text>
        <Text style={styles.paragraph}>
          3.1. Исполнитель обязуется:
        </Text>
        <Text style={styles.indent}>
          3.1.1. Оказать Услуги качественно и в срок, указанный в п. 1.2 настоящего Договора.
        </Text>
        <Text style={styles.indent}>
          3.1.2. По завершении оказания Услуг предоставить Заказчику Акт оказанных услуг.
        </Text>
        <Text style={styles.paragraph}>
          3.2. Заказчик обязуется:
        </Text>
        <Text style={styles.indent}>
          3.2.1. Предоставить Исполнителю информацию и документы, необходимые для оказания Услуг.
        </Text>
        <Text style={styles.indent}>
          3.2.2. Принять и оплатить Услуги в порядке и сроки, установленные настоящим Договором.
        </Text>

        {/* 4. Приёмка услуг */}
        <Text style={styles.sectionTitle}>4. ПОРЯДОК СДАЧИ-ПРИЁМКИ УСЛУГ</Text>
        <Text style={styles.paragraph}>
          4.1. По завершении оказания Услуг Исполнитель направляет Заказчику Акт оказанных услуг в двух экземплярах.
        </Text>
        <Text style={styles.paragraph}>
          4.2. Заказчик в течение 5 (пяти) рабочих дней с момента получения Акта обязан подписать его или направить мотивированный отказ.
        </Text>
        <Text style={styles.paragraph}>
          4.3. В случае неподписания Акта и непредставления мотивированного отказа в указанный срок, Услуги считаются принятыми Заказчиком.
        </Text>

        {/* 5. Ответственность */}
        <Text style={styles.sectionTitle}>5. ОТВЕТСТВЕННОСТЬ СТОРОН</Text>
        <Text style={styles.paragraph}>
          5.1. За нарушение сроков оплаты Заказчик уплачивает Исполнителю неустойку в размере {data.penaltyRate || 0.1}% от суммы задолженности за каждый день просрочки.
        </Text>
        <Text style={styles.paragraph}>
          5.2. За нарушение сроков оказания Услуг Исполнитель уплачивает Заказчику неустойку в размере {data.penaltyRate || 0.1}% от стоимости Услуг за каждый день просрочки.
        </Text>

        {/* 6. Срок действия */}
        <Text style={styles.sectionTitle}>6. СРОК ДЕЙСТВИЯ И РАСТОРЖЕНИЕ</Text>
        <Text style={styles.paragraph}>
          6.1. Настоящий Договор вступает в силу с момента его подписания и действует до полного исполнения Сторонами своих обязательств.
        </Text>
        <Text style={styles.paragraph}>
          6.2. Каждая из Сторон вправе расторгнуть Договор в одностороннем порядке, уведомив другую Сторону в письменной форме не менее чем за 10 (десять) рабочих дней.
        </Text>

        {/* 7. Прочие условия */}
        <Text style={styles.sectionTitle}>7. ПРОЧИЕ УСЛОВИЯ</Text>
        <Text style={styles.paragraph}>
          7.1. Все споры разрешаются путём переговоров. При недостижении согласия споры передаются на рассмотрение в {data.jurisdiction || 'Арбитражный суд г. Москвы'}.
        </Text>
        <Text style={styles.paragraph}>
          7.2. Договор составлен в двух экземплярах, имеющих равную юридическую силу.
        </Text>

        {/* Реквизиты и подписи */}
        <Text style={styles.sectionTitle}>8. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</Text>
        <View style={styles.signatures}>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Исполнитель</Text>
            <Text style={styles.signatureDetail}>{data.supplier.name}</Text>
            <Text style={styles.signatureDetail}>ИНН: {data.supplier.inn}</Text>
            {data.supplier.kpp && <Text style={styles.signatureDetail}>КПП: {data.supplier.kpp}</Text>}
            {data.supplier.address && <Text style={styles.signatureDetail}>{data.supplier.address}</Text>}
            {data.supplier.accountNumber && <Text style={styles.signatureDetail}>Р/с: {data.supplier.accountNumber}</Text>}
            {data.supplier.bankName && <Text style={styles.signatureDetail}>Банк: {data.supplier.bankName}</Text>}
            {data.supplier.bik && <Text style={styles.signatureDetail}>БИК: {data.supplier.bik}</Text>}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{supplierTitle} / {supplierName}</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Заказчик</Text>
            <Text style={styles.signatureDetail}>{data.buyer.name}</Text>
            <Text style={styles.signatureDetail}>ИНН: {data.buyer.inn}</Text>
            {data.buyer.kpp && <Text style={styles.signatureDetail}>КПП: {data.buyer.kpp}</Text>}
            {data.buyer.address && <Text style={styles.signatureDetail}>{data.buyer.address}</Text>}
            {data.buyer.accountNumber && <Text style={styles.signatureDetail}>Р/с: {data.buyer.accountNumber}</Text>}
            {data.buyer.bankName && <Text style={styles.signatureDetail}>Банк: {data.buyer.bankName}</Text>}
            {data.buyer.bik && <Text style={styles.signatureDetail}>БИК: {data.buyer.bik}</Text>}
            <View style={styles.signatureLine} />
            <Text style={styles.signatureName}>{buyerTitle} / {buyerName}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

function numberWord(n: number): string {
  const words: Record<number, string> = {
    1: 'одного', 2: 'двух', 3: 'трёх', 4: 'четырёх', 5: 'пяти',
    7: 'семи', 10: 'десяти', 14: 'четырнадцати', 30: 'тридцати',
  }
  return words[n] || String(n)
}
