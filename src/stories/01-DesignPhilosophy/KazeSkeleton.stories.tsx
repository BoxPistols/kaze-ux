import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Kaze 骨格 (Skeleton)
 * 「墨で書かれ、風で運ばれる」世界観を1枚に凝縮する視覚的契約。
 * 既存 MUI トークンに依存せず、骨格案そのものをハードコードで提示する。
 * この Story で合意した値を token 層に落とす。
 */

const FONT_IMPORT =
  'https://fonts.googleapis.com/css2' +
  '?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1' +
  '&family=IBM+Plex+Sans:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Sans+JP:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Mono:wght@400;500;600' +
  '&display=swap'

const tokens = {
  kazeTeal: '#0EADB8',
  sumi: '#0A0A0A',
  washi: '#F7F4EE',
  asagi: '#5B8FB9',
  beni: '#E34E3A',
  washiInk: 'rgba(10, 10, 10, 0.88)',
  washiMute: 'rgba(10, 10, 10, 0.54)',
  washiHair: 'rgba(10, 10, 10, 0.12)',
  washiMist: 'rgba(10, 10, 10, 0.04)',
}

// 骨格案を scope 内だけで強制するためのスタイル文字列。
// preview-head.html が Inter を !important で固定しているので、
// 同じ強度で data-kaze-skeleton スコープ内を上書きする。
const scopedCss = `
  @import url('${FONT_IMPORT}');

  [data-kaze-skeleton] {
    --kaze-teal: ${tokens.kazeTeal};
    --sumi: ${tokens.sumi};
    --washi: ${tokens.washi};
    --asagi: ${tokens.asagi};
    --beni: ${tokens.beni};
    --ink: ${tokens.washiInk};
    --mute: ${tokens.washiMute};
    --hair: ${tokens.washiHair};
    --mist: ${tokens.washiMist};

    --r-sharp: 2px;
    --r-soft: 8px;
    --r-gen: 24px;
    --r-full: 9999px;

    --ease-kaze: cubic-bezier(0.33, 0, 0, 1);
    --dur-micro: 120ms;
    --dur-macro: 240ms;
    --dur-scene: 480ms;

    --f-display: 'Fraunces', 'Shippori Mincho B1', 'Noto Serif JP', serif;
    --f-body: 'IBM Plex Sans', 'IBM Plex Sans JP', 'Hiragino Kaku Gothic ProN', sans-serif;
    --f-mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, monospace;

    background: var(--washi);
    color: var(--ink);
    min-height: 100vh;
  }

  [data-kaze-skeleton],
  [data-kaze-skeleton] *,
  [data-kaze-skeleton] *::before,
  [data-kaze-skeleton] *::after {
    font-family: var(--f-body) !important;
    box-sizing: border-box !important;
  }
  [data-kaze-skeleton] .display,
  [data-kaze-skeleton] .display * {
    font-family: var(--f-display) !important;
    font-feature-settings: 'ss01', 'ss02';
  }
  [data-kaze-skeleton] .mono,
  [data-kaze-skeleton] .mono * {
    font-family: var(--f-mono) !important;
  }

  [data-kaze-skeleton] ::selection {
    background: var(--kaze-teal);
    color: var(--washi);
  }

  @keyframes kazeBreath {
    0%, 100% { font-variation-settings: 'opsz' 144, 'wght' 340, 'SOFT' 30, 'WONK' 0; }
    50%      { font-variation-settings: 'opsz' 144, 'wght' 420, 'SOFT' 70, 'WONK' 1; }
  }
  @keyframes kazeDrift {
    0%   { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-12vw, 0, 0); }
  }
  @keyframes kazeRise {
    0%   { transform: translate3d(0, 12px, 0); opacity: 0; }
    100% { transform: translate3d(0, 0, 0); opacity: 1; }
  }
`

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) => (
  <section
    style={{
      padding: '96px clamp(24px, 6vw, 96px)',
      borderTop: `1px solid ${tokens.washiHair}`,
    }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'baseline',
        marginBottom: 48,
      }}
    >
      <div
        className='mono'
        style={{
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: tokens.washiMute,
          paddingTop: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        className='display'
        style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 380,
          letterSpacing: '-0.02em',
          lineHeight: 1.05,
          margin: 0,
          fontVariationSettings: "'opsz' 144, 'SOFT' 30, 'WONK' 0",
        }}
      >
        {title}
      </h2>
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)',
      }}
    >
      <div />
      <div>{children}</div>
    </div>
  </section>
)

const Hero = () => (
  <section
    style={{
      position: 'relative',
      minHeight: '92vh',
      padding: '10vh clamp(24px, 6vw, 96px) 6vh',
      overflow: 'hidden',
    }}
  >
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(${tokens.washiHair} 1px, transparent 1px),
          linear-gradient(90deg, ${tokens.washiHair} 1px, transparent 1px)
        `,
        backgroundSize: '88px 88px',
        opacity: 0.6,
        maskImage:
          'radial-gradient(circle at 30% 40%, black 0%, transparent 70%)',
      }}
    />
    <div
      aria-hidden
      className='display'
      style={{
        position: 'absolute',
        top: '18vh',
        left: '-2vw',
        fontSize: 'clamp(280px, 40vw, 560px)',
        lineHeight: 0.78,
        color: tokens.kazeTeal,
        opacity: 0.08,
        userSelect: 'none',
        animation: 'kazeDrift 24s var(--ease-kaze) infinite alternate',
      }}
    >
      風
    </div>
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)',
      }}
    >
      <div
        className='mono'
        style={{
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: tokens.washiMute,
          paddingTop: 10,
          animation: 'kazeRise 480ms var(--ease-kaze) 0ms both',
        }}
      >
        Skeleton / v0 / 2026
      </div>
      <div>
        <h1
          className='display'
          style={{
            fontSize: 'clamp(64px, 11vw, 180px)',
            fontWeight: 380,
            letterSpacing: '-0.035em',
            lineHeight: 0.95,
            margin: '0 0 32px',
            animation:
              'kazeRise 720ms var(--ease-kaze) 120ms both, kazeBreath 9s var(--ease-kaze) 1200ms infinite',
          }}
        >
          墨で書かれ、<br />風で運ばれる。
        </h1>
        <p
          style={{
            fontSize: 'clamp(16px, 1.3vw, 20px)',
            lineHeight: 1.7,
            maxWidth: '56ch',
            color: tokens.washiMute,
            margin: '0 0 48px',
            animation: 'kazeRise 720ms var(--ease-kaze) 240ms both',
          }}
        >
          Written in ink. Carried by wind. Kaze{' '}
          <span className='mono' style={{ color: tokens.kazeTeal }}>
            (/kaze/)
          </span>{' '}
          is a design skeleton that commits to four foundations — typography,
          color, radius, motion — and refuses the rest.
        </p>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            animation: 'kazeRise 720ms var(--ease-kaze) 360ms both',
          }}
        >
          {['Fraunces × IBM Plex', '5 colors', '4 radii', '1 ease'].map(
            (label) => (
              <span
                key={label}
                className='mono'
                style={{
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  padding: '8px 14px',
                  border: `1px solid ${tokens.sumi}`,
                  borderRadius: 2,
                  color: tokens.sumi,
                  background: 'transparent',
                }}
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  </section>
)

const TypographySection = () => (
  <Section eyebrow='01 — Type' title='Fraunces が書き、Plex が話す。'>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 48,
        marginBottom: 64,
      }}
    >
      <div>
        <div
          className='mono'
          style={{
            fontSize: 10,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: tokens.washiMute,
            marginBottom: 16,
          }}
        >
          Display / Fraunces Variable
        </div>
        <p
          className='display'
          style={{
            fontSize: 72,
            lineHeight: 0.95,
            letterSpacing: '-0.025em',
            margin: 0,
            fontVariationSettings: "'opsz' 144, 'wght' 340, 'SOFT' 30, 'WONK' 0",
          }}
        >
          風の骨
        </p>
        <p
          className='display'
          style={{
            fontSize: 56,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            margin: '12px 0 0',
            fontStyle: 'italic',
            fontVariationSettings: "'opsz' 144, 'wght' 420, 'SOFT' 70, 'WONK' 1",
          }}
        >
          Bone of Wind
        </p>
        <div
          className='mono'
          style={{
            fontSize: 11,
            color: tokens.washiMute,
            marginTop: 16,
            lineHeight: 1.8,
          }}
        >
          opsz 144 · wght 340–420 · SOFT 30–70 · WONK 0–1
        </div>
      </div>

      <div>
        <div
          className='mono'
          style={{
            fontSize: 10,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: tokens.washiMute,
            marginBottom: 16,
          }}
        >
          Body / IBM Plex Sans + JP
        </div>
        <p
          style={{
            fontSize: 40,
            fontWeight: 500,
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          骨のある活字
        </p>
        <p
          style={{
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.35,
            margin: '8px 0 0',
          }}
        >
          Body with Bone
        </p>
        <p
          style={{
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.7,
            margin: '20px 0 0',
            maxWidth: '40ch',
            color: tokens.washiInk,
          }}
        >
          Plex は Inter よりも微かに slab の気配があり、日本語の Plex Sans JP
          と自然に並ぶ。line-height 1.7 で editorial な呼吸を作る。
        </p>
      </div>
    </div>

    <div
      style={{
        borderTop: `1px solid ${tokens.washiHair}`,
        paddingTop: 32,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: 32,
      }}
    >
      {[
        { label: 'Caption', size: 11, weight: 500 },
        { label: 'Body-S', size: 13, weight: 400 },
        { label: 'Body', size: 15, weight: 400 },
        { label: 'Lead', size: 20, weight: 400 },
        { label: 'H3', size: 28, weight: 500 },
      ].map((row) => (
        <div key={row.label}>
          <div
            className='mono'
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: tokens.washiMute,
              marginBottom: 6,
            }}
          >
            {row.label} · {row.size}
          </div>
          <div
            style={{
              fontSize: row.size,
              fontWeight: row.weight,
              lineHeight: 1.5,
            }}
          >
            風が通る
          </div>
        </div>
      ))}
    </div>
  </Section>
)

const ColorSection = () => {
  const swatches = [
    {
      name: 'Kaze Teal',
      jp: '風',
      hex: tokens.kazeTeal,
      role: 'Primary / Action',
      ink: tokens.washi,
      bordered: false,
    },
    {
      name: 'Sumi',
      jp: '墨',
      hex: tokens.sumi,
      role: 'Text / Structure',
      ink: tokens.washi,
      bordered: false,
    },
    {
      name: 'Washi',
      jp: '和紙',
      hex: tokens.washi,
      role: 'Surface / Rest',
      ink: tokens.sumi,
      bordered: true,
    },
    {
      name: 'Asagi',
      jp: '浅葱',
      hex: tokens.asagi,
      role: 'Info / Link',
      ink: tokens.washi,
      bordered: false,
    },
    {
      name: 'Beni',
      jp: '紅',
      hex: tokens.beni,
      role: 'Alert / Accent',
      ink: tokens.washi,
      bordered: false,
    },
  ]
  return (
    <Section eyebrow='02 — Color' title='五色。主従は明確に。'>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          gap: 2,
          height: 320,
          marginBottom: 32,
        }}
      >
        {swatches.map((s) => (
          <div
            key={s.name}
            style={{
              background: s.hex,
              color: s.ink,
              padding: 20,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: s.bordered ? `1px solid ${tokens.washiHair}` : 'none',
              transition: 'transform 240ms cubic-bezier(0.33, 0, 0, 1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              className='display'
              style={{
                fontSize: 56,
                lineHeight: 1,
                letterSpacing: '-0.02em',
                fontVariationSettings: "'opsz' 144, 'SOFT' 30",
              }}
            >
              {s.jp}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                {s.name}
              </div>
              <div
                className='mono'
                style={{ fontSize: 11, opacity: 0.75, marginBottom: 8 }}
              >
                {s.hex.toUpperCase()}
              </div>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  opacity: 0.7,
                }}
              >
                {s.role}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: tokens.washiMute,
          margin: 0,
          maxWidth: '58ch',
        }}
      >
        主役は Kaze Teal。面積比でヒエラルキーを担保する（Teal {'>'} Sumi{' >'}{' '}
        Asagi ≒ Beni）。Asagi と Beni は画面内 5% 未満に厳格に制限。 Dark
        モードでは Sumi が支配面、彩度は teal/asagi で +10 補正する。
      </p>
    </Section>
  )
}

const RadiusSection = () => {
  const rows = [
    {
      label: 'r-sharp',
      value: '2px',
      usage: 'button · input · chip · tab',
      demo: (
        <button
          type='button'
          style={{
            background: tokens.sumi,
            color: tokens.washi,
            border: 'none',
            borderRadius: 2,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          Request demo
        </button>
      ),
    },
    {
      label: 'r-soft',
      value: '8px',
      usage: 'card · panel · popover',
      demo: (
        <div
          style={{
            background: tokens.washi,
            border: `1px solid ${tokens.washiHair}`,
            borderRadius: 8,
            padding: 16,
            fontSize: 12,
            lineHeight: 1.6,
            width: 160,
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 4 }}>Card</div>
          <div style={{ color: tokens.washiMute, fontSize: 11 }}>
            Soft corner, soft voice.
          </div>
        </div>
      ),
    },
    {
      label: 'r-gen',
      value: '24px',
      usage: 'modal · hero · section',
      demo: (
        <div
          style={{
            background: tokens.kazeTeal,
            color: tokens.washi,
            borderRadius: 24,
            padding: '24px 28px',
            fontSize: 13,
            width: 200,
          }}
        >
          <div className='display' style={{ fontSize: 22, marginBottom: 4 }}>
            Welcome
          </div>
          <div style={{ opacity: 0.85, fontSize: 11 }}>Hero-scale block.</div>
        </div>
      ),
    },
    {
      label: 'r-full',
      value: '9999px',
      usage: 'avatar · tag · pill',
      demo: (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            className='display'
            style={{
              width: 44,
              height: 44,
              borderRadius: 9999,
              background: tokens.asagi,
              color: tokens.washi,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            K
          </div>
          <span
            className='mono'
            style={{
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              padding: '6px 12px',
              background: tokens.washiMist,
              borderRadius: 9999,
            }}
          >
            tag
          </span>
        </div>
      ),
    },
  ]
  return (
    <Section eyebrow='03 — Radius' title='四段のみ。差は明快に。'>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 24,
        }}
      >
        {rows.map((r) => (
          <div
            key={r.label}
            style={{
              background: tokens.washiMist,
              padding: 28,
              borderRadius: 8,
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 24,
              border: `1px solid ${tokens.washiHair}`,
            }}
          >
            <div>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: tokens.washiMute,
                  marginBottom: 6,
                }}
              >
                {r.label}
              </div>
              <div
                className='display'
                style={{
                  fontSize: 36,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {r.value}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: tokens.washiMute,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {r.usage}
              </div>
            </div>
            <div>{r.demo}</div>
          </div>
        ))}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: tokens.washiMute,
          margin: '32px 0 0',
          maxWidth: '58ch',
        }}
      >
        現行 7 段（4/6/8/10/12/16/full）は識別不能なノイズを生むので廃止。
        段差が大きいほど階層は明瞭になる。Braun・Rams の流儀。
      </p>
    </Section>
  )
}

const MotionSection = () => (
  <Section eyebrow='04 — Motion' title='一つのイージング。風は跳ね返らない。'>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24,
        marginBottom: 40,
      }}
    >
      {[
        { label: 'Micro', dur: '120ms', use: 'hover · focus · toggle' },
        { label: 'Macro', dur: '240ms', use: 'panel · tab · drawer' },
        { label: 'Scene', dur: '480ms', use: 'modal · route · hero' },
      ].map((m) => (
        <div
          key={m.label}
          style={{
            padding: 28,
            borderRadius: 8,
            border: `1px solid ${tokens.washiHair}`,
            background: tokens.washi,
          }}
        >
          <div
            className='mono'
            style={{
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: tokens.washiMute,
              marginBottom: 6,
            }}
          >
            {m.label}
          </div>
          <div
            className='display'
            style={{
              fontSize: 40,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {m.dur}
          </div>
          <div
            style={{
              fontSize: 12,
              color: tokens.washiMute,
              marginTop: 8,
            }}
          >
            {m.use}
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        background: tokens.sumi,
        color: tokens.washi,
        borderRadius: 8,
        padding: 'clamp(32px, 5vw, 56px)',
      }}
    >
      <div
        className='mono'
        style={{
          fontSize: 10,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          opacity: 0.55,
          marginBottom: 16,
        }}
      >
        Try — hover the block
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {[
          { label: 'Kaze', ease: 'cubic-bezier(0.33, 0, 0, 1)', good: true },
          {
            label: 'Spring',
            ease: 'cubic-bezier(0.5, 1.6, 0.4, 1)',
            good: false,
          },
          { label: 'Linear', ease: 'linear', good: false },
        ].map((e) => (
          <button
            key={e.label}
            type='button'
            style={{
              background: e.good ? tokens.kazeTeal : 'transparent',
              color: tokens.washi,
              border: e.good ? 'none' : '1px solid rgba(247,244,238,0.3)',
              borderRadius: 2,
              padding: '24px 20px',
              fontSize: 13,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: `transform 240ms ${e.ease}`,
              textAlign: 'left',
            }}
            onMouseEnter={(ev) => {
              ev.currentTarget.style.transform = 'translateX(32px)'
            }}
            onMouseLeave={(ev) => {
              ev.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div style={{ fontWeight: 500, marginBottom: 6 }}>
              {e.label} {e.good ? '✓' : '✕'}
            </div>
            <div className='mono' style={{ fontSize: 10, opacity: 0.7 }}>
              {e.ease}
            </div>
          </button>
        ))}
      </div>
      <p
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          opacity: 0.7,
          margin: '24px 0 0',
          maxWidth: '58ch',
        }}
      >
        採用：<code className='mono'>cubic-bezier(0.33, 0, 0, 1)</code>。
        風は加速して、静かに止む。Spring の bounce は強すぎて、Linear は感情が無い。
      </p>
    </div>
  </Section>
)

const CommitmentSection = () => {
  const commits = [
    {
      num: '01',
      keep: 'Washi 背景 + Sumi テキスト',
      drop: 'Pure white 背景',
    },
    {
      num: '02',
      keep: 'Fraunces (variable) + Plex',
      drop: 'Inter + Noto Sans JP の量産和欧混植',
    },
    {
      num: '03',
      keep: '4 段の radius (2 / 8 / 24 / full)',
      drop: '7 段の radius (4/6/8/10/12/16)',
    },
    {
      num: '04',
      keep: '単一 ease-kaze + 3 duration',
      drop: 'spring / bounce / overshoot',
    },
    {
      num: '05',
      keep: 'Asagi / Beni は画面 5% 以下',
      drop: 'MUI stock red / blue の流用',
    },
  ]
  return (
    <Section eyebrow='Commit' title='残すもの、捨てるもの。'>
      <div
        style={{
          display: 'grid',
          gap: 1,
          background: tokens.washiHair,
          border: `1px solid ${tokens.washiHair}`,
        }}
      >
        {commits.map((c) => (
          <div
            key={c.num}
            style={{
              background: tokens.washi,
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: '60px 1fr 1fr',
              gap: 32,
              alignItems: 'baseline',
            }}
          >
            <div
              className='display'
              style={{
                fontSize: 32,
                color: tokens.kazeTeal,
                letterSpacing: '-0.02em',
              }}
            >
              {c.num}
            </div>
            <div>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: tokens.kazeTeal,
                  marginBottom: 6,
                }}
              >
                Keep
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.5 }}>{c.keep}</div>
            </div>
            <div>
              <div
                className='mono'
                style={{
                  fontSize: 10,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: tokens.beni,
                  marginBottom: 6,
                }}
              >
                Drop
              </div>
              <div
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: tokens.washiMute,
                  textDecoration: 'line-through',
                  textDecorationColor: tokens.beni,
                  textDecorationThickness: '1px',
                }}
              >
                {c.drop}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

const Footer = () => (
  <footer
    style={{
      padding: '96px clamp(24px, 6vw, 96px) 120px',
      borderTop: `1px solid ${tokens.washiHair}`,
    }}
  >
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 180px) minmax(0, 1fr)',
        gap: 'clamp(24px, 4vw, 64px)',
        alignItems: 'end',
      }}
    >
      <div
        className='mono'
        style={{
          fontSize: 11,
          letterSpacing: '0.24em',
          textTransform: 'uppercase',
          color: tokens.washiMute,
        }}
      >
        Kaze / Skeleton
      </div>
      <div
        className='display'
        style={{
          fontSize: 'clamp(40px, 6vw, 72px)',
          letterSpacing: '-0.025em',
          lineHeight: 1,
          fontVariationSettings: "'opsz' 144, 'SOFT' 40, 'WONK' 1",
        }}
      >
        合意なら、次は token 層。
      </div>
    </div>
  </footer>
)

const KazeSkeleton = () => (
  <>
    <style>{scopedCss}</style>
    <div data-kaze-skeleton>
      <Hero />
      <TypographySection />
      <ColorSection />
      <RadiusSection />
      <MotionSection />
      <CommitmentSection />
      <Footer />
    </div>
  </>
)

const meta: Meta<typeof KazeSkeleton> = {
  title: 'Design Philosophy/Kaze Skeleton',
  component: KazeSkeleton,
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
    fullscreenNoPadding: true,
    docs: { page: null },
    backgrounds: { disable: true },
  },
  tags: ['!autodocs'],
}

export default meta

type Story = StoryObj<typeof KazeSkeleton>

export const Skeleton: Story = {}
