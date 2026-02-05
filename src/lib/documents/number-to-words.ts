// Сумма прописью на русском языке
// Поддержка: рубли, копейки

const units = [
  '', 'один', 'два', 'три', 'четыре', 'пять',
  'шесть', 'семь', 'восемь', 'девять', 'десять',
  'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
]

const unitsFeminine = [
  '', 'одна', 'две', 'три', 'четыре', 'пять',
  'шесть', 'семь', 'восемь', 'девять', 'десять',
  'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать',
]

const tens = [
  '', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят',
  'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто',
]

const hundreds = [
  '', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот',
  'шестьсот', 'семьсот', 'восемьсот', 'девятьсот',
]

interface ScaleWord {
  one: string
  few: string
  many: string
  feminine: boolean
}

const scales: ScaleWord[] = [
  { one: '', few: '', many: '', feminine: false },
  { one: 'тысяча', few: 'тысячи', many: 'тысяч', feminine: true },
  { one: 'миллион', few: 'миллиона', many: 'миллионов', feminine: false },
  { one: 'миллиард', few: 'миллиарда', many: 'миллиардов', feminine: false },
]

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10
  const mod100 = n % 100

  if (mod100 >= 11 && mod100 <= 19) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

function convertHundreds(n: number, feminine: boolean): string {
  const parts: string[] = []

  if (n >= 100) {
    parts.push(hundreds[Math.floor(n / 100)])
    n %= 100
  }

  if (n >= 20) {
    parts.push(tens[Math.floor(n / 10)])
    n %= 10
  }

  if (n > 0) {
    parts.push(feminine ? unitsFeminine[n] : units[n])
  }

  return parts.join(' ')
}

function numberToWordsRaw(n: number): string {
  if (n === 0) return 'ноль'

  const parts: string[] = []
  let scaleIndex = 0

  while (n > 0) {
    const chunk = n % 1000
    if (chunk > 0) {
      const scale = scales[scaleIndex]
      const words = convertHundreds(chunk, scale.feminine)
      const scaleWord = scaleIndex > 0
        ? pluralize(chunk, scale.one, scale.few, scale.many)
        : ''
      parts.unshift(words + (scaleWord ? ' ' + scaleWord : ''))
    }
    n = Math.floor(n / 1000)
    scaleIndex++
  }

  return parts.join(' ')
}

// Сумма прописью с валютой
export function amountToWords(amount: number): string {
  const rubles = Math.floor(amount)
  const kopecks = Math.round((amount - rubles) * 100)

  const rublesWord = pluralize(rubles, 'рубль', 'рубля', 'рублей')
  const kopecksWord = pluralize(kopecks, 'копейка', 'копейки', 'копеек')

  const rublesText = numberToWordsRaw(rubles)
  // Первая буква заглавная
  const capitalizedRubles = rublesText.charAt(0).toUpperCase() + rublesText.slice(1)

  const kopecksStr = kopecks.toString().padStart(2, '0')

  return `${capitalizedRubles} ${rublesWord} ${kopecksStr} ${kopecksWord}`
}
