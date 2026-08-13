import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  HeartHandshake,
  Music4,
  Palette,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react'

const options = {
  mood: [
    'Dreamy garden party',
    'Quiet candlelit reflection',
    'Golden hour celebration',
    'Art-house memory night',
  ],
  music: ['Indie playlist', 'String quartet', 'Soul + jazz', 'Ambient piano'],
  dressCode: ['Soft neutrals', 'Black but elegant', 'Colorful and bold', 'Come as you are'],
  flowers: ['Wildflowers', 'White lilies', 'Sunset roses', 'No flowers'],
  venue: ['Garden', 'Beachside', 'Modern chapel', 'Rooftop gathering'],
  farewellStyle: ['Spiritual', 'Non-religious', 'Mixed traditions', 'Storytelling-led'],
  food: ['Champagne + canapes', 'Tea and pastries', 'Comfort food buffet', 'No catering'],
  color: ['Rose dusk', 'Sage mist', 'Midnight plum', 'Sky silver'],
}

const paletteMap = {
  'Rose dusk': ['#fff4f1', '#f3c7d8', '#7f4c6e'],
  'Sage mist': ['#f3f7f1', '#bfd3c1', '#476158'],
  'Midnight plum': ['#f7f1fb', '#c9b2e1', '#4b2e83'],
  'Sky silver': ['#f4f8fb', '#cad9e8', '#4a6072'],
}

const summaryLine = (profile) =>
  `A ${profile.mood.toLowerCase()} with ${profile.music.toLowerCase()}, ${profile.flowers.toLowerCase()}, and a ${profile.dressCode.toLowerCase()} dress code.`

function ChipGroup({ label, items, value, onChange, icon: Icon }) {
  return (
    <section className="panel section-gap">
      <div className="section-head">
        <div className="icon-wrap">{Icon ? <Icon size={18} /> : null}</div>
        <div>
          <p className="eyebrow">Pick one</p>
          <h3>{label}</h3>
        </div>
      </div>
      <div className="chip-grid">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            className={`chip ${value === item ? 'chip-active' : ''}`}
            onClick={() => onChange(item)}
          >
            <span>{item}</span>
            {value === item ? <Check size={16} /> : null}
          </button>
        ))}
      </div>
    </section>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [profile, setProfile] = useState({
    mood: options.mood[0],
    music: options.music[0],
    dressCode: options.dressCode[0],
    flowers: options.flowers[0],
    venue: options.venue[0],
    farewellStyle: options.farewellStyle[0],
    food: options.food[0],
    color: options.color[0],
  })

  const palette = paletteMap[profile.color]

  const shareText = useMemo(() => {
    return `I designed my farewell: ${profile.mood}, ${profile.music}, ${profile.venue}. What would yours look like?`
  }, [profile])

  const cards = [
    { label: 'Mood', value: profile.mood },
    { label: 'Music', value: profile.music },
    { label: 'Venue', value: profile.venue },
    { label: 'Style', value: profile.farewellStyle },
    { label: 'Flowers', value: profile.flowers },
    { label: 'Food', value: profile.food },
  ]

  return (
    <div className="app-shell" style={{ '--bg': palette[0], '--accent': palette[1], '--ink': palette[2] }}>
      <header className="hero">
        <nav className="topbar">
          <div className="brand">
            <Sparkles size={18} />
            <span>OMWGod</span>
          </div>
          <button type="button" className="ghost-button" onClick={() => setStarted(true)}>
            Fix my funeral
          </button>
        </nav>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">OMWGod, we need to talk</p>
            <h1>They’re going to play the wrong song at your funeral.</h1>
            <p className="hero-text">
              Your family means well. Their taste is another story.
            </p>
            <div className="cta-row">
              <button type="button" className="primary-button" onClick={() => setStarted(true)}>
                Fix My Funeral <ArrowRight size={18} />
              </button>
              <button type="button" className="secondary-button">
                See an example
              </button>
            </div>
            <div className="social-proof">
              <span>Not dying. Just avoiding a terrible playlist.</span>
            </div>
          </div>

          <aside className="preview-card preview-hero">
            <div className="preview-glow" />
            <p className="eyebrow">Live preview</p>
            <h2>{profile.mood}</h2>
            <p>{summaryLine(profile)}</p>
            <div className="mini-tags">
              <span>{profile.venue}</span>
              <span>{profile.music}</span>
              <span>{profile.color}</span>
            </div>
          </aside>
        </div>
      </header>

      <main className="main-grid">
        <section className="designer-column">
          <div className="section-intro" id="designer">
            <p className="eyebrow">Interactive designer</p>
            <h2>Build it in minutes</h2>
            <p>
              I think this should lead with aesthetics first, not end-of-life logistics. That is the
              stronger consumer hook and the better viral surface.
            </p>
          </div>

          {started ? (
            <div className="designer-stack">
              <ChipGroup
                label="Overall mood"
                items={options.mood}
                value={profile.mood}
                onChange={(mood) => setProfile((current) => ({ ...current, mood }))}
                icon={Sparkles}
              />
              <ChipGroup
                label="Music"
                items={options.music}
                value={profile.music}
                onChange={(music) => setProfile((current) => ({ ...current, music }))}
                icon={Music4}
              />
              <ChipGroup
                label="Dress code"
                items={options.dressCode}
                value={profile.dressCode}
                onChange={(dressCode) => setProfile((current) => ({ ...current, dressCode }))}
                icon={Users}
              />
              <ChipGroup
                label="Flowers"
                items={options.flowers}
                value={profile.flowers}
                onChange={(flowers) => setProfile((current) => ({ ...current, flowers }))}
                icon={HeartHandshake}
              />
              <ChipGroup
                label="Venue atmosphere"
                items={options.venue}
                value={profile.venue}
                onChange={(venue) => setProfile((current) => ({ ...current, venue }))}
                icon={Sparkles}
              />
              <ChipGroup
                label="Ceremony style"
                items={options.farewellStyle}
                value={profile.farewellStyle}
                onChange={(farewellStyle) => setProfile((current) => ({ ...current, farewellStyle }))}
                icon={HeartHandshake}
              />
              <ChipGroup
                label="Food"
                items={options.food}
                value={profile.food}
                onChange={(food) => setProfile((current) => ({ ...current, food }))}
                icon={Users}
              />
              <ChipGroup
                label="Colour palette"
                items={options.color}
                value={profile.color}
                onChange={(color) => setProfile((current) => ({ ...current, color }))}
                icon={Palette}
              />
            </div>
          ) : (
            <section className="panel soft-panel">
              <p className="soft-kicker">Start with one tap</p>
              <h3>Choose a mood and the whole thing comes alive.</h3>
              <button type="button" className="primary-button" onClick={() => setStarted(true)}>
                Open designer <ArrowRight size={18} />
              </button>
            </section>
          )}
        </section>

        <aside className="preview-column">
          <section className="preview-card sticky-card">
            <p className="eyebrow">Your Farewell</p>
            <h2>{profile.mood}</h2>
            <p className="preview-summary">{summaryLine(profile)}</p>

            <div className="preview-grid">
              {cards.map((card) => (
                <div className="preview-tile" key={card.label}>
                  <span>{card.label}</span>
                  <strong>{card.value}</strong>
                </div>
              ))}
            </div>

            <div className="share-card">
              <div>
                <p className="eyebrow">Share prompt</p>
                <p>{shareText}</p>
              </div>
              <button type="button" className="secondary-button share-button">
                <Share2 size={16} /> Share
              </button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}
