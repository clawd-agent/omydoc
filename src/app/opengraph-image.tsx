import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'OMyDoc — Генератор документов для бизнеса'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo and title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
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
          <span
            style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            OMyDoc
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '42px',
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '900px',
          }}
        >
          Генератор документов для бизнеса
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '40px',
            marginTop: '50px',
          }}
        >
          {['Счета', 'Акты', 'Договоры'].map((item) => (
            <div
              key={item}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '28px',
                color: 'white',
              }}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Bottom text */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.8)',
          }}
        >
          omydoc.ru • Бесплатно • Без регистрации
        </div>
      </div>
    ),
    { ...size }
  )
}
