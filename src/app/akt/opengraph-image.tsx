import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Создать акт выполненных работ онлайн — OMyDoc'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div
          style={{
            width: '100px',
            height: '100px',
            background: 'white',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
        </div>

        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Акт выполненных работ
        </div>

        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            textAlign: 'center',
            maxWidth: '800px',
          }}
        >
          Закройте сделку за 2 минуты
        </div>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginTop: '40px',
          }}
        >
          {['Из счёта в 1 клик', 'Сумма прописью', 'PDF'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '22px',
                color: 'white',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '28px',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          OMyDoc
        </div>
      </div>
    ),
    { ...size }
  )
}
