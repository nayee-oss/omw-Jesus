import { useEffect, useMemo, useRef, useState } from 'react'
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

const venueOptions = [
  {
    id: 'classic-hall',
    name: 'The Classic Hall',
    detail: 'Family-approved. Auntie-certified.',
    image: 'https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'sunset-beach',
    name: 'Sunset Beach',
    detail: 'Pretty, sandy, emotionally expensive.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'secret-garden',
    name: 'Secret Garden',
    detail: 'Fairy lights carrying the whole event.',
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'rooftop-afterparty',
    name: 'Rooftop Afterparty',
    detail: 'One last noise complaint.',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'private-bar',
    name: 'Private Bar',
    detail: 'Open tab. Closed casket. Great lighting.',
    image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'into-the-wild',
    name: 'Into the Wild',
    detail: 'Touch grass. Permanently.',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=85',
  },
]

const bodyOptions = [
  {
    id: 'cremation',
    icon: '✦',
    title: 'Cremation',
    line: 'Keep it compact.',
    note: 'Urn, scattering, keepsake — details come next.',
    color: '#ff8a66',
  },
  {
    id: 'burial',
    icon: '↓',
    title: 'Burial',
    line: 'Classic underground era.',
    note: 'Coffin and resting-place choices come next.',
    color: '#98d6a7',
  },
  {
    id: 'green-burial',
    icon: '♧',
    title: 'Green burial',
    line: 'Return me to nature.',
    note: 'Low-impact options, where locally available.',
    color: '#b9e26a',
  },
  {
    id: 'sea',
    icon: '≈',
    title: 'Sea farewell',
    line: 'Let the ocean handle it.',
    note: 'Sea burial or ash scattering, depending on local rules.',
    color: '#79cce8',
  },
  {
    id: 'donation',
    icon: '+',
    title: 'Donate my body',
    line: 'One final contribution.',
    note: 'This usually requires separate registration with an eligible institution.',
    color: '#d5b8f0',
  },
  {
    id: 'not-sure',
    icon: '?',
    title: 'I genuinely don’t know',
    line: 'Fair. This got specific quickly.',
    note: 'Save it for later. No forced decisions here.',
    color: '#f5d66f',
  },
]

const avatarOptions = {
  skin: [
    { label: 'Moonlight', value: '#f7d7c4' },
    { label: 'Honey', value: '#dca77b' },
    { label: 'Caramel', value: '#a96845' },
    { label: 'Deep glow', value: '#633e2b' },
  ],
  hair: ['Soft wave', 'Sharp bob', 'Cloud curls', 'Tiny buzz'],
  outfit: ['Main character', 'Soft launch', 'Chaos formal', 'Afterparty'],
  expression: ['Chill', 'Smug', 'Delighted'],
}

function AvatarCreator({ avatar, onChange, onContinue, onBack, ready }) {
  return (
    <main className="avatar-screen">
      <nav className="game-topbar">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="game-progress">
          <span>Character setup</span>
          <strong>1 / 6</strong>
        </div>
        <div className="brand compact-brand">
          <Sparkles size={17} />
          <span>OMWGod</span>
        </div>
      </nav>

      <section className="avatar-layout">
        <div className="avatar-stage-wrap">
          <div className="stage-copy">
            <p className="eyebrow">First things first</p>
            <h1>Create your final character.</h1>
            <p>Looking alive is optional. Looking good isn’t.</p>
          </div>

          <div className="avatar-stage" aria-label="Your avatar preview">
            <div className="pixel-star star-one">✦</div>
            <div className="pixel-star star-two">✦</div>
            <div className={`avatar avatar-${avatar.hair.toLowerCase().replaceAll(' ', '-')}`}>
              <div className="avatar-hair-back" style={{ backgroundColor: avatar.hairColor }} />
              <div className="avatar-head" style={{ backgroundColor: avatar.skin }}>
                <div className="avatar-hair-front" style={{ backgroundColor: avatar.hairColor }} />
                <div className={`avatar-face face-${avatar.expression.toLowerCase()}`}>
                  <span className="avatar-eye left-eye" />
                  <span className="avatar-eye right-eye" />
                  <span className="avatar-mouth" />
                </div>
              </div>
              <div className={`avatar-body outfit-${avatar.outfit.toLowerCase().replaceAll(' ', '-')}`}>
                <span className="avatar-arm left-arm" style={{ backgroundColor: avatar.skin }} />
                <span className="avatar-arm right-arm" style={{ backgroundColor: avatar.skin }} />
                <span className="outfit-mark">OMG</span>
              </div>
              <div className="avatar-legs">
                <span />
                <span />
              </div>
            </div>
            <div className="avatar-platform" />
            <span className="avatar-caption">Tiny you. Huge responsibility.</span>
          </div>
        </div>

        <div className="avatar-controls">
          <div className="control-block">
            <div className="control-title">
              <span>01</span>
              <h2>Pick your glow</h2>
            </div>
            <div className="swatch-row">
              {avatarOptions.skin.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={`color-swatch ${avatar.skin === item.value ? 'selected' : ''}`}
                  style={{ '--swatch': item.value }}
                  onClick={() => onChange({ skin: item.value })}
                  aria-label={item.label}
                  title={item.label}
                />
              ))}
            </div>
          </div>

          <div className="control-block">
            <div className="control-title">
              <span>02</span>
              <h2>Hair situation</h2>
            </div>
            <div className="choice-row">
              {avatarOptions.hair.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={avatar.hair === item ? 'choice-pill selected' : 'choice-pill'}
                  onClick={() => onChange({ hair: item })}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="swatch-row hair-swatches">
              {['#291f2c', '#76513a', '#efb84a', '#ee7e9a'].map((color) => (
                <button
                  type="button"
                  key={color}
                  className={`color-swatch ${avatar.hairColor === color ? 'selected' : ''}`}
                  style={{ '--swatch': color }}
                  onClick={() => onChange({ hairColor: color })}
                  aria-label={`Hair color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="control-block">
            <div className="control-title">
              <span>03</span>
              <h2>Choose the fit</h2>
            </div>
            <div className="choice-row">
              {avatarOptions.outfit.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={avatar.outfit === item ? 'choice-pill selected' : 'choice-pill'}
                  onClick={() => onChange({ outfit: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block compact-control">
            <div className="control-title">
              <span>04</span>
              <h2>Face card</h2>
            </div>
            <div className="choice-row">
              {avatarOptions.expression.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={avatar.expression === item ? 'choice-pill selected' : 'choice-pill'}
                  onClick={() => onChange({ expression: item })}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="continue-button" onClick={onContinue}>
            {ready ? 'Avatar locked. Next level soon.' : 'That’s me enough'}
            {ready ? <Check size={19} /> : <ArrowRight size={19} />}
          </button>
        </div>
      </section>
    </main>
  )
}

function DepartureTransition({ avatar, onComplete, onBack }) {
  const [leaving, setLeaving] = useState(false)
  const finishTimer = useRef(null)

  useEffect(() => () => window.clearTimeout(finishTimer.current), [])

  const finish = () => {
    if (leaving) return
    setLeaving(true)
    finishTimer.current = window.setTimeout(onComplete, 420)
  }

  return (
    <main className={`departure-screen ${leaving ? 'is-leaving' : ''}`}>
      <button type="button" className="departure-back" onClick={onBack} aria-label="Back to avatar">
        ← redo my face
      </button>
      <button type="button" className="departure-skip" onClick={finish}>
        skip the dramatic bit →
      </button>

      <section className="departure-scene" onAnimationEnd={(event) => {
        if (event.animationName === 'departure-finish') finish()
      }}>
        <div className="memory-frame">
          <div className={`avatar departure-avatar avatar-${avatar.hair.toLowerCase().replaceAll(' ', '-')}`}>
            <div className="avatar-hair-back" style={{ backgroundColor: avatar.hairColor }} />
            <div className="avatar-head" style={{ backgroundColor: avatar.skin }}>
              <div className="avatar-hair-front" style={{ backgroundColor: avatar.hairColor }} />
              <div className={`avatar-face face-${avatar.expression.toLowerCase()}`}>
                <span className="avatar-eye left-eye" />
                <span className="avatar-eye right-eye" />
                <span className="avatar-mouth" />
              </div>
            </div>
            <div className={`avatar-body outfit-${avatar.outfit.toLowerCase().replaceAll(' ', '-')}`}>
              <span className="avatar-arm left-arm" style={{ backgroundColor: avatar.skin }} />
              <span className="avatar-arm right-arm" style={{ backgroundColor: avatar.skin }} />
              <span className="outfit-mark">OMG</span>
            </div>
            <div className="avatar-legs">
              <span />
              <span />
            </div>
          </div>
          <div className="memory-flash" />
          <span className="memory-label">gone to sort out the playlist</span>
        </div>

        <div className="pixel-soul" aria-hidden="true">
          <span>✦</span>
          <span>✦</span>
          <span>✦</span>
        </div>

        <div className="departure-title">
          <p>OMWGOD PRESENTS</p>
          <h1>On my way<br />to God.</h1>
          <span>Okay. First practical question.</span>
        </div>
        <div className="departure-timer" />
      </section>
    </main>
  )
}

function VenueCreator({ selectedVenue, customVenue, onSelect, onCustomChange, onBack, onContinue, ready }) {
  return (
    <main className="venue-screen">
      <nav className="game-topbar venue-topbar">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="game-progress">
          <span>Set the scene</span>
          <strong>3 / 6</strong>
        </div>
        <div className="brand compact-brand">
          <Sparkles size={17} />
          <span>OMWGod</span>
        </div>
      </nav>

      <header className="venue-heading">
        <div>
          <p className="eyebrow">LEVEL 03 · PICK YOUR MAP</p>
          <h1>Where’s the final function?</h1>
        </div>
        <p>Your relatives will book a beige room if you don’t choose now.</p>
      </header>

      <section className="venue-grid" aria-label="Venue choices">
        {venueOptions.map((venue) => (
          <button
            type="button"
            key={venue.id}
            className={`venue-card ${selectedVenue === venue.id ? 'selected' : ''}`}
            onClick={() => onSelect(venue.id)}
            aria-pressed={selectedVenue === venue.id}
          >
            <img src={venue.image} alt="" />
            <span className="venue-shade" />
            <span className="venue-number">0{venueOptions.indexOf(venue) + 1}</span>
            <span className="venue-copy">
              <strong>{venue.name}</strong>
              <small>{venue.detail}</small>
            </span>
            <span className="venue-check">{selectedVenue === venue.id ? <Check size={18} /> : '↗'}</span>
          </button>
        ))}
      </section>

      <section className="vision-box">
        <div className="vision-copy">
          <p className="eyebrow">SECRET MAP UNLOCKED</p>
          <h2>Nope. My brain made a better one.</h2>
          <p>Drop the oddly specific vision. We support creative control issues.</p>
        </div>
        <div className="vision-input-wrap">
          <textarea
            value={customVenue}
            onChange={(event) => onCustomChange(event.target.value)}
            onFocus={() => onSelect('custom')}
            placeholder="Snowy mountain. Everyone in silver. Northern lights. My ex is not invited."
            rows="4"
          />
          <span>{customVenue.length} / 240</span>
        </div>
        <button
          type="button"
          className="continue-button venue-continue"
          onClick={onContinue}
          disabled={!selectedVenue || (selectedVenue === 'custom' && !customVenue.trim())}
        >
          {ready ? 'Map saved. Nobody touch it.' : 'Lock this chaos in'}
          {ready ? <Check size={19} /> : <ArrowRight size={19} />}
        </button>
      </section>
    </main>
  )
}

function BodyChoice({ selectedBody, onSelect, onBack, onContinue, ready }) {
  return (
    <main className="body-screen">
      <nav className="game-topbar body-topbar">
        <button type="button" className="icon-button" onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="game-progress">
          <span>Choose the route</span>
          <strong>2 / 6</strong>
        </div>
        <div className="brand compact-brand">
          <Sparkles size={17} />
          <span>OMWGod</span>
        </div>
      </nav>

      <header className="body-heading">
        <p className="eyebrow">LEVEL 02 · THE BODY QUESTION</p>
        <h1>So… what are we doing with the body?</h1>
        <p>Weird question. Important answer. Pick what feels closest — you can change it later.</p>
      </header>

      <section className="body-choice-grid" aria-label="Body arrangement choices">
        {bodyOptions.map((option, index) => (
          <button
            type="button"
            key={option.id}
            className={`body-choice ${selectedBody === option.id ? 'selected' : ''}`}
            style={{ '--choice-color': option.color }}
            onClick={() => onSelect(option.id)}
            aria-pressed={selectedBody === option.id}
          >
            <span className="body-choice-index">0{index + 1}</span>
            <span className="body-choice-icon" aria-hidden="true">{option.icon}</span>
            <span className="body-choice-copy">
              <strong>{option.title}</strong>
              <em>{option.line}</em>
              <small>{option.note}</small>
            </span>
            <span className="body-choice-status">
              {selectedBody === option.id ? <Check size={20} /> : 'CHOOSE'}
            </span>
          </button>
        ))}
      </section>

      <footer className="body-footer">
        <p>
          <strong>Tiny serious note:</strong> This records a preference, not a legal registration.
          Local rules and formal donation programmes still apply.
        </p>
        <button
          type="button"
          className="continue-button body-continue"
          onClick={onContinue}
          disabled={!selectedBody}
        >
          {ready ? 'Route saved. Body handled-ish.' : 'Lock in the route'}
          {ready ? <Check size={19} /> : <ArrowRight size={19} />}
        </button>
      </footer>
    </main>
  )
}

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
  const [screen, setScreen] = useState('landing')
  const [avatarReady, setAvatarReady] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState('')
  const [customVenue, setCustomVenue] = useState('')
  const [venueReady, setVenueReady] = useState(false)
  const [selectedBody, setSelectedBody] = useState('')
  const [bodyReady, setBodyReady] = useState(false)
  const [avatar, setAvatar] = useState({
    skin: avatarOptions.skin[1].value,
    hair: avatarOptions.hair[0],
    hairColor: '#291f2c',
    outfit: avatarOptions.outfit[0],
    expression: avatarOptions.expression[0],
  })
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

  if (screen === 'avatar') {
    return (
      <AvatarCreator
        avatar={avatar}
        onChange={(updates) => setAvatar((current) => ({ ...current, ...updates }))}
        onBack={() => setScreen('landing')}
        onContinue={() => {
          setAvatarReady(true)
          setScreen('departure')
        }}
        ready={avatarReady}
      />
    )
  }

  if (screen === 'departure') {
    return (
      <DepartureTransition
        avatar={avatar}
        onBack={() => setScreen('avatar')}
        onComplete={() => setScreen('body')}
      />
    )
  }

  if (screen === 'venue') {
    return (
      <VenueCreator
        selectedVenue={selectedVenue}
        customVenue={customVenue}
        onSelect={(venue) => setSelectedVenue(venue)}
        onCustomChange={(value) => setCustomVenue(value.slice(0, 240))}
        onBack={() => setScreen('body')}
        onContinue={() => setVenueReady(true)}
        ready={venueReady}
      />
    )
  }

  if (screen === 'body') {
    return (
      <BodyChoice
        selectedBody={selectedBody}
        onSelect={(body) => setSelectedBody(body)}
        onBack={() => setScreen('departure')}
        onContinue={() => {
          setBodyReady(true)
          setScreen('venue')
        }}
        ready={bodyReady}
      />
    )
  }

  return (
    <div className="app-shell" style={{ '--bg': palette[0], '--accent': palette[1], '--ink': palette[2] }}>
      <header className="hero">
        <nav className="topbar">
          <div className="brand">
            <Sparkles size={18} />
            <span>OMWGod</span>
          </div>
          <button type="button" className="ghost-button" onClick={() => setScreen('avatar')}>
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
              <button type="button" className="primary-button" onClick={() => setScreen('avatar')}>
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

          {false ? (
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
              <button type="button" className="primary-button" onClick={() => setScreen('avatar')}>
                Create my character <ArrowRight size={18} />
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
