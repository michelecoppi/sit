import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRightIcon,
  BeakerIcon,
  BoltIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  CommandLineIcon,
  ExclamationTriangleIcon,
  CubeTransparentIcon,
  GlobeAltIcon,
  LanguageIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  RectangleGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { encodeTextToSit } from '../utils/encoder'

const capabilities = [
  {
    title: 'Deterministic by design',
    description: 'Every byte maps to an exact eight-symbol token. No ambiguity, hidden state or server round-trip.',
    icon: CubeTransparentIcon,
    tone: 'violet',
  },
  {
    title: 'Native semantic layer',
    description: 'Move beyond binary substitution with a concept-first alphabet, grammar and multilingual resolver.',
    icon: LanguageIcon,
    tone: 'teal',
  },
  {
    title: 'Local-first tooling',
    description: 'Encode, decode and validate entirely in your browser. Your payload never leaves the device.',
    icon: LockClosedIcon,
    tone: 'blue',
  },
  {
    title: 'Open specification',
    description: 'Inspect the reference implementation, RFC registry and every decision behind the standard.',
    icon: GlobeAltIcon,
    tone: 'amber',
  },
]

const registryLinks = [
  { to: '/alphabet', label: 'Alphabet', detail: 'Canonical symbols', icon: RectangleGroupIcon },
  { to: '/grammar', label: 'Grammar', detail: 'Composition rules', icon: CodeBracketIcon },
  { to: '/dictionary', label: 'Dictionary', detail: 'Search the registry', icon: CircleStackIcon },
  { to: '/semantic', label: 'Semantic', detail: 'Resolve concepts', icon: SparklesIcon },
]

const reveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45 },
}

export default function HomePage() {
  const [sample, setSample] = useState('SIT')
  const [copied, setCopied] = useState(false)
  const encoded = useMemo(() => encodeTextToSit(sample || 'SIT'), [sample])

  const copyEncoded = async () => {
    try {
      await navigator.clipboard.writeText(encoded)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="home-page">
      <motion.section {...reveal} className="home-hero">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />

        <div className="hero-copy">
          <div className="eyebrow-badge">
            <span className="eyebrow-signal" aria-hidden="true" />
            Open standard · SIT 2.0 available
          </div>
          <h1>
            Information,
            <span> reimagined symbolically.</span>
          </h1>
          <p className="hero-lead">
            A precise, open encoding standard built on the <code>{'{6,7}'}</code> alphabet—designed for humans,
            machines and an internet ready for better symbols.
          </p>
          <div className="hero-actions">
            <Link to="/playground" className="home-button home-button-primary">
              <BeakerIcon aria-hidden="true" />
              Open playground
              <ArrowRightIcon aria-hidden="true" />
            </Link>
            <Link to="/docs" className="home-button home-button-secondary">
              Read the standard
            </Link>
          </div>
          <div className="hero-proof" aria-label="Platform benefits">
            <span><CheckCircleIcon aria-hidden="true" /> Runs locally</span>
            <span><CheckCircleIcon aria-hidden="true" /> Zero dependencies at runtime</span>
            <span><CheckCircleIcon aria-hidden="true" /> Open source</span>
          </div>
        </div>

        <div className="encoder-console">
          <div className="console-chrome">
            <span className="console-dots" aria-hidden="true"><i /><i /><i /></span>
            <span><CommandLineIcon aria-hidden="true" /> live_encoder.sit</span>
            <span className="console-live"><i aria-hidden="true" /> Live</span>
          </div>
          <div className="console-body">
            <label htmlFor="hero-encoder">Type a message</label>
            <div className="console-input-row">
              <input
                id="hero-encoder"
                value={sample}
                maxLength={28}
                onChange={(event) => setSample(event.target.value)}
                placeholder="Type something…"
              />
              <span>{sample.length}/28</span>
            </div>
            <div className="console-flow">
              <span>UTF-8</span><i aria-hidden="true" /><span>SYMBOLIC TOKEN</span><i aria-hidden="true" /><span>VALID</span>
            </div>
            <div className="console-output">
              <div>
                <span>Encoded output</span>
                <strong>{Math.max(sample.length, 1)} SYTE</strong>
              </div>
              <code>{encoded}</code>
            </div>
            <button type="button" className="console-copy" onClick={copyEncoded}>
              <ClipboardDocumentCheckIcon aria-hidden="true" />
              {copied ? 'Copied to clipboard' : 'Copy symbolic payload'}
            </button>
          </div>
          <div className="console-status">
            <span><i aria-hidden="true" /> Compliance passed</span>
            <span>Protocol 67</span>
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} transition={{ delay: .06, duration: .45 }} className="registry-strip" aria-labelledby="registry-title">
        <div className="registry-intro">
          <p>Native SIT 2.0</p>
          <h2 id="registry-title">Explore the registry</h2>
        </div>
        <div className="registry-links">
          {registryLinks.map(({ to, label, detail, icon: Icon }) => (
            <Link key={to} to={to}>
              <span><Icon aria-hidden="true" /></span>
              <span><strong>{label}</strong><small>{detail}</small></span>
              <ArrowRightIcon aria-hidden="true" />
            </Link>
          ))}
        </div>
      </motion.section>

      <section className="capabilities-section" aria-labelledby="capabilities-title">
        <div className="section-heading">
          <div>
            <p className="section-kicker">One small alphabet. A complete system.</p>
            <h2 id="capabilities-title">Serious tooling for symbolic information.</h2>
          </div>
          <p>SIT keeps the implementation understandable while covering the full path from byte-compatible encoding to native semantics.</p>
        </div>

        <div className="capability-grid">
          {capabilities.map(({ title, description, icon: Icon, tone }, index) => (
            <motion.article
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: index * .05, duration: .35 }}
              className={`capability-card capability-${tone}`}
            >
              <span className="capability-icon"><Icon aria-hidden="true" /></span>
              <span className="capability-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="capability-line" aria-hidden="true" />
            </motion.article>
          ))}
        </div>
      </section>

      <section className="performance-panel" aria-labelledby="performance-title">
        <div className="performance-copy">
          <span className="performance-icon"><BoltIcon aria-hidden="true" /></span>
          <p className="section-kicker">Engineered to stay lightweight</p>
          <h2 id="performance-title">Fast enough to feel instant. Simple enough to trust.</h2>
          <p>Core conversions are pure browser operations with route-level code splitting and no network dependency.</p>
          <Link to="/docs">Review the specification <ArrowRightIcon aria-hidden="true" /></Link>
        </div>
        <div className="performance-metrics">
          <div><strong>0</strong><span>server calls to encode</span></div>
          <div><strong>2</strong><span>symbols in the base alphabet</span></div>
          <div><strong>8</strong><span>symbols per legacy token</span></div>
          <div><strong>100%</strong><span>open reference code</span></div>
        </div>
      </section>

      <section className="chat-onboarding-section" aria-labelledby="chat-onboarding-title">
        <div className="section-heading chat-onboarding-heading">
          <div>
            <p className="section-kicker">SIT beyond the browser</p>
            <h2 id="chat-onboarding-title">Start using SIT in chat.</h2>
          </div>
          <p>Keep the playground for local work, or bring SIT into the conversations you already have every day.</p>
        </div>

        <div className="chat-onboarding-grid">
          <article className="chat-onboarding-card chat-onboarding-discord">
            <div className="chat-onboarding-card-topline">
              <span className="chat-onboarding-icon"><ChatBubbleLeftRightIcon aria-hidden="true" /></span>
              <span>Discord</span>
            </div>
            <h3>Bring SIT into your server.</h3>
            <p>Use the official bot for commands, researcher progress and auto-translation with your community.</p>
            <ol>
              <li>Add the official bot to your server.</li>
              <li>Run <code>/register</code> if you are new to SIT.</li>
              <li>Use <code>/encode</code> or <code>/decode</code> in a command.</li>
            </ol>
            <div className="chat-onboarding-account-alert">
              <ExclamationTriangleIcon aria-hidden="true" />
              <p>
                <strong>Already use SIT on Telegram?</strong> Keep one identity: open <Link to="/profile">your profile</Link>,
                connect Discord under Connected Accounts, then complete the link there instead of running <code>/register</code>.
              </p>
            </div>
            <a
              href="https://discord.com/oauth2/authorize?client_id=1529070805772927076"
              className="chat-onboarding-link"
              target="_blank"
              rel="noreferrer"
            >
              Add SIT to Discord <ArrowRightIcon aria-hidden="true" />
            </a>
          </article>

          <article className="chat-onboarding-card chat-onboarding-telegram">
            <div className="chat-onboarding-card-topline">
              <span className="chat-onboarding-icon"><PaperAirplaneIcon aria-hidden="true" /></span>
              <span>Telegram</span>
            </div>
            <h3>Encode and decode from anywhere.</h3>
            <p>Open the official bot on mobile or desktop for quick, private SIT operations wherever you are.</p>
            <ol>
              <li>Open <code>@SITTTBOT</code> in Telegram.</li>
              <li>Send <code>/start</code> if you are new to SIT.</li>
              <li>Use <code>/encode</code> or <code>/decode</code> when you need it.</li>
            </ol>
            <div className="chat-onboarding-account-alert">
              <ExclamationTriangleIcon aria-hidden="true" />
              <p>
                <strong>Already use SIT on Discord?</strong> Do not send <code>/start</code>. Open <Link to="/profile">your profile</Link>,
                connect Telegram under Connected Accounts, then send the generated <code>/link</code> code to the bot.
              </p>
            </div>
            <a href="https://t.me/SITTTBOT" className="chat-onboarding-link" target="_blank" rel="noreferrer">
              Open SIT on Telegram <ArrowRightIcon aria-hidden="true" />
            </a>
          </article>
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="cta-mark"><SparklesIcon aria-hidden="true" /></span>
          <div>
            <p>Ready to translate an idea?</p>
            <h2>Start with the playground. No setup required.</h2>
          </div>
        </div>
        <Link to="/playground" className="home-button home-button-light">
          Launch encoder <ArrowRightIcon aria-hidden="true" />
        </Link>
      </section>
    </div>
  )
}
