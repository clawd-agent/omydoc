import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Создать акт выполненных работ онлайн — OmyDoc'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #F8FAFC 0%, #ECFDF5 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '100px',
            height: '100px',
            background: '#10B981',
            borderRadius: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.3)',
          }}
        >
          <svg
            width="52"
            height="52"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="m9 15 2 2 4-4" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#0F172A',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            marginBottom: '16px',
            display: 'flex',
          }}
        >
          Акт выполненных работ
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#64748B',
            textAlign: 'center',
            marginBottom: '32px',
            display: 'flex',
          }}
        >
          Закройте сделку за 2 минуты
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          <div
            style={{
              background: '#ECFDF5',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#059669',
              display: 'flex',
            }}
          >
            Из счёта в 1 клик
          </div>
          <div
            style={{
              background: '#ECFDF5',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#059669',
              display: 'flex',
            }}
          >
            Сумма прописью
          </div>
          <div
            style={{
              background: '#ECFDF5',
              padding: '12px 24px',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 600,
              color: '#059669',
              display: 'flex',
            }}
          >
            PDF
          </div>
        </div>

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '48px',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#2563EB',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
          </div>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            OmyDoc
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
