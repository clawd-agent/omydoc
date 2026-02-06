import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'OmyDoc — Генератор документов для бизнеса'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              background: '#2563EB',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              <path d="M10 9H8" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.03em',
            }}
          >
            OmyDoc
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              color: '#0F172A',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            Бизнес-документы
          </span>
          <span
            style={{
              fontSize: '56px',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #2563EB, #8B5CF6)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            за 2 минуты
          </span>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              border: '2px solid #E2E8F0',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#334155',
              display: 'flex',
            }}
          >
            Счета
          </div>
          <div
            style={{
              background: 'white',
              border: '2px solid #E2E8F0',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#334155',
              display: 'flex',
            }}
          >
            Акты
          </div>
          <div
            style={{
              background: 'white',
              border: '2px solid #E2E8F0',
              padding: '14px 28px',
              borderRadius: '16px',
              fontSize: '22px',
              fontWeight: 700,
              color: '#334155',
              display: 'flex',
            }}
          >
            Договоры
          </div>
        </div>

        {/* Bottom text */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            fontSize: '20px',
            fontWeight: 600,
            color: '#64748B',
            marginTop: '48px',
          }}
        >
          <span style={{ display: 'flex' }}>✓ Бесплатно</span>
          <span style={{ display: 'flex' }}>✓ Без регистрации</span>
          <span style={{ display: 'flex' }}>✓ Авто-заполнение по ИНН</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
