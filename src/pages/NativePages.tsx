import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AlphabetTable from '../components/AlphabetTable'
import DictionarySearch from '../components/DictionarySearch'
import GrammarCard from '../components/GrammarCard'
import { nativeDecode, nativeDictionary, nativeEncode } from '../data/native'

const punctuationSectionNames = ['COMMA', 'PERIOD', 'COLON', 'SEMICOLON', 'QUESTIONMARK', 'EXCLAMATIONMARK', 'APOSTROPHE', 'QUOTATIONMARK', 'HYPHEN', 'DASH', 'SLASH', 'ELLIPSIS'] as const
const groupingSectionNames = ['LEFTPAREN', 'RIGHTPAREN', 'LEFTBRACKET', 'RIGHTBRACKET', 'LEFTBRACE', 'RIGHTBRACE', 'LEFTANGLE', 'RIGHTANGLE'] as const
const operatorSectionNames = ['ATSIGN', 'HASH', 'PIPE', 'AMPERSAND', 'ASTERISK', 'PLUSSIGN', 'EQUALSSIGN', 'BACKSLASH'] as const

const getNativeEntriesByName = (names: readonly string[]) => names
  .map((name) => nativeDictionary.find((entry) => entry.name === name))
  .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="native-hero">
      <p className="text-xs font-semibold uppercase tracking-[.24em] text-blue-600 sm:text-sm sm:tracking-[.28em]">{eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">{title}</h1>
      <div className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8 dark:text-slate-300">{children}</div>
    </section>
  )
}

export function NativePage() {
  const sections = [
    ['/alphabet', 'Official Alphabet', 'Browse native symbols and categories.'],
    ['/grammar', 'Symbolic Grammar', 'Learn how tokens compose expressions.'],
    ['/dictionary', 'Dictionary', 'Search the semantic registry.'],
    ['/semantic', 'Semantic Engine', 'Explore multilingual concepts.'],
    ['/explorer', 'Character Explorer', 'Inspect each official token.'],
  ]

  return (
    <div className="space-y-8">
      <Header eyebrow="SIT 2.0" title="Native Symbolic Encoding">
        SIT no longer translates ASCII. Concepts are represented directly by an official symbolic grammar,
        with legacy conversion retained only for compatibility.
      </Header>

      <div className="grid gap-5 md:grid-cols-2">
        <article className="native-card">
          <h2 className="text-xl font-semibold">SIT 1.0 - Legacy tools</h2>
          <pre className="mt-4 native-flow">Text -&gt; ASCII -&gt; Binary -&gt; SIT</pre>
          <Link className="native-tab mt-5 inline-block" to="/playground">
            Open Playground
          </Link>
        </article>

        <article className="native-card border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/20">
          <h2 className="text-xl font-semibold">SIT 2.0 - Native tools</h2>
          <pre className="mt-4 native-flow">Concept -&gt; SIT Grammar -&gt; Native SIT</pre>
          <Link className="native-tab native-tab-active mt-5 inline-block" to="/playground">
            Open Playground - choose 2.0
          </Link>
        </article>
      </div>

      <GrammarCard />

      <section>
        <h2 className="mb-4 text-2xl font-semibold">SIT 2.0 sections</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map(([path, title, body]) => (
            <Link className="native-card transition hover:-translate-y-1" key={path} to={path}>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{body}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export function AlphabetPage() {
  const alphabetEntries = nativeDictionary.filter((entry) => !operatorSectionNames.includes(entry.name as (typeof operatorSectionNames)[number]))

  return (
    <div className="native-v2">
      <div className="space-y-8">
        <Header eyebrow="RFC-0002" title="Official SIT Alphabet">
          Each official token has a native code, semantic meaning and category. These fictional codes
          intentionally use only 6 and 7.
        </Header>
        <article className="native-card">
          <AlphabetTable entries={alphabetEntries} showPunctuationFilter={false} />
        </article>
      </div>
    </div>
  )
}

export function GrammarPage() {
  return (
    <div className="native-v2">
      <div className="space-y-8">
        <Header eyebrow="RFC-0003" title="Symbolic Grammar">
          Native SIT structures a message as meaningful concepts rather than an encoded stream of bytes.
        </Header>
        <GrammarCard />
        <article className="native-card">
          <h2 className="text-xl font-semibold">Expression example</h2>
          <pre className="mt-4 native-flow">PERSON + SHARE + MESSAGE + NOW</pre>
        </article>
      </div>
    </div>
  )
}

export function PunctuationPage() {
  const punctuationEntries = getNativeEntriesByName(punctuationSectionNames)
  const groupingEntries = getNativeEntriesByName(groupingSectionNames)
  const operatorEntries = getNativeEntriesByName(operatorSectionNames)

  useEffect(() => {
    const search = window.location.hash.split('?')[1] ?? ''
    const section = new URLSearchParams(search).get('section')
    if (!section) {
      return
    }

    document.getElementById(section)?.scrollIntoView({ block: 'start' })
  }, [])

  return (
    <div className="native-v2">
      <div className="space-y-8">
        <Header eyebrow="RFC-0006" title="Punctuation and Symbolic Operators">
          SIT 2.0 treats punctuation as a first-class native layer. Grouping marks, separators and operator-style
          symbols are official tokens with deterministic spacing and decoding behavior.
        </Header>

        <article className="native-card">
          <h2 className="text-xl font-semibold">Core rules</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <a className="native-tab" href="#/punctuation?section=punctuation">Punctuation</a>
            <a className="native-tab" href="#/punctuation?section=grouping">Grouping</a>
            <a className="native-tab" href="#/punctuation?section=operators">Operators</a>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Closers bind left</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tokens like <code className="native-code">, . : ; ? ! ) ] &#125; &gt;</code> attach to the token before them.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Openers bind right</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tokens like <code className="native-code">( [ &#123; &lt; @ #</code> attach to the token that follows.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Joiners stay inline</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tokens like <code className="native-code">' " - -- / \ | &amp; + = *</code> remain inside the same symbolic segment.</p>
            </div>
          </div>
        </article>

        <article id="punctuation" className="native-card scroll-mt-28">
          <h2 className="text-xl font-semibold">Punctuation</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Sentence boundaries, pauses and inline joins are all first-class SIT tokens.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {punctuationEntries.map((entry) => <span key={entry.id} className="native-pill">{entry.symbol ?? entry.name} {entry.name}</span>)}
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <pre className="native-flow">HELLO, WORLD!</pre>
            <pre className="native-flow">THINK...</pre>
            <pre className="native-flow">WHY?</pre>
          </div>
        </article>

        <article id="grouping" className="native-card scroll-mt-28">
          <h2 className="text-xl font-semibold">Grouping</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Grouping marks define explicit symbolic scope and must decode in stable enclosure order.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {groupingEntries.map((entry) => <span key={entry.id} className="native-pill">{entry.symbol ?? entry.name} {entry.name}</span>)}
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <pre className="native-flow">(HELLO)</pre>
            <pre className="native-flow">[PLAN] -- BUILD.</pre>
            <pre className="native-flow">&lt;CODE&gt;</pre>
          </div>
        </article>

        <article id="operators" className="native-card scroll-mt-28">
          <h2 className="text-xl font-semibold">Operators</h2>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Operator-style symbols create compact relations for addressing, assignment, branching and inline composition.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {operatorEntries.map((entry) => <span key={entry.id} className="native-pill">{entry.symbol ?? entry.name} {entry.name}</span>)}
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <pre className="native-flow">@USER = VALUE</pre>
            <pre className="native-flow">CODE\FILE</pre>
            <pre className="native-flow">@USER | #TAG</pre>
          </div>
        </article>

        <article className="native-card">
          <h2 className="text-xl font-semibold">Registered punctuation tokens</h2>
          <AlphabetTable entries={punctuationEntries} />
        </article>
      </div>
    </div>
  )
}

export function DictionaryPage() {
  return (
    <div className="space-y-8">
      <Header eyebrow="Semantic registry" title="Native Dictionary">
        Search the canonical vocabulary by meaning, category or native sequence.
      </Header>
      <DictionarySearch />
    </div>
  )
}

export function SemanticPage() {
  const [query, setQuery] = useState('HELLO')

  const normalizedQuery = query.trim().toLowerCase()

  const matches = useMemo(() => {
    if (!normalizedQuery) {
      return nativeDictionary.slice(0, 8)
    }

    return nativeDictionary.filter((item) =>
      [item.name, item.symbol ?? '', item.aliases.join(' '), item.meaning, item.code, item.examples.join(' ')].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const entry = useMemo(() => {
    if (!normalizedQuery) {
      return nativeDictionary.find((item) => item.name === 'HELLO') ?? nativeDictionary[0] ?? null
    }

    const upperQuery = query.trim().toUpperCase()
    const exactMatch = nativeDictionary.find((item) => item.name === upperQuery || item.code === query.trim() || item.symbol === query.trim() || item.aliases.includes(query.trim()))
    return exactMatch ?? matches[0] ?? null
  }, [matches, normalizedQuery, query])

  return (
    <div className="native-v2">
      <div className="space-y-8">
        <Header eyebrow="RFC-0004" title="Semantic Engine">
          A single native concept can be expressed in many natural languages without changing its symbolic
          identity.
        </Header>
        <article className="native-card">
          <label htmlFor="semantic-search" className="text-sm font-semibold">Search concept or code</label>
          <input
            id="semantic-search"
            className="native-input mt-2"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try HELLO, TRUST, 6676766767766767, greeting..."
          />

          {matches.length ? (
            <div className="native-suggestions">
              {matches.slice(0, 8).map((item) => (
                <button key={item.id} type="button" onClick={() => setQuery(item.name)}>
                  {item.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">No semantic concept matched your search.</p>
          )}

          {entry ? (
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-slate-500">Native SIT sequence</p>
                <code className="native-code mt-2 inline-block">{entry.code}</code>
              </div>
              <div>
                <p className="text-sm text-slate-500">Meaning</p>
                <p className="mt-2 font-semibold">{entry.meaning}</p>
                {entry.symbol ? <p className="mt-2 text-sm text-slate-500">Symbol: <code className="native-code">{entry.symbol}</code></p> : null}
              </div>
              <div>
                <p className="text-sm text-slate-500">Natural outputs</p>
                <p className="mt-2 font-semibold">{entry.examples.join(' | ')}</p>
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </div>
  )
}

export function CharacterExplorerPage() {
  return (
    <div className="space-y-8">
      <Header eyebrow="Registry explorer" title="Character Explorer">
        Explore every official symbolic token, its introduction version and intended usage.
      </Header>
      <AlphabetTable />
    </div>
  )
}

const modes = ['Native Encoder', 'Native Decoder', 'Semantic Explorer', 'Official Alphabet', 'Dictionary Explorer'] as const
type Mode = (typeof modes)[number]

export function NativePlayground() {
  const [mode, setMode] = useState<Mode>('Native Encoder')
  const [value, setValue] = useState('HELLO')
  const [showCanonicalDecode, setShowCanonicalDecode] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const deferredValue = useDeferredValue(value)

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }

    const maxHeight = 360
    input.style.height = 'auto'
    input.style.height = `${Math.min(input.scrollHeight, maxHeight)}px`
    input.style.overflowY = input.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [mode, value])

  const handleCopy = async (text: string, label: string) => {
    const normalizedText = text.trim()

    if (!normalizedText) {
      setCopyStatus('No output available to copy yet.')
      return
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable')
      }

      await navigator.clipboard.writeText(normalizedText)
      setCopyStatus(`${label} copied to clipboard.`)
    } catch {
      setCopyStatus('Clipboard unavailable. Select the output manually to copy it.')
    }
  }

  const output = useMemo(() => {
    if (mode === 'Native Encoder') {
      return nativeEncode(deferredValue)
    }
    if (mode === 'Native Decoder') {
      return nativeDecode(deferredValue)
    }
    if (mode === 'Semantic Explorer') {
      return nativeDictionary.find((item) => item.name === deferredValue.toUpperCase())?.description ?? 'Select an official concept.'
    }
    return ''
  }, [deferredValue, mode])

  const canonicalDecodeOutput = useMemo(() => {
    if (mode !== 'Native Decoder' || !showCanonicalDecode) {
      return ''
    }

    return nativeDecode(deferredValue, { mode: 'canonical' })
  }, [deferredValue, mode, showCanonicalDecode])

  const setModeDefaults = (selectedMode: Mode) => {
    setMode(selectedMode)
    setCopyStatus('')
    if (selectedMode === 'Native Decoder') {
      setValue('6667677667767676')
      return
    }
    if (selectedMode === 'Native Encoder') {
      setValue('HELLO, WORLD!')
      return
    }
    setValue('HELLO')
  }

  const isLookupMode = mode === 'Official Alphabet' || mode === 'Dictionary Explorer'

  return (
    <div className="space-y-6">
      <Header eyebrow="SIT 2.0 - Native operations" title="Native Playground">
        Encode concepts directly into the SIT alphabet. No ASCII, binary or legacy conversion enters this workspace.
        <div className="native-status">
          <span>* Native protocol online</span>
          <span>6/7 alphabet only</span>
          <span>v2.0 registry</span>
        </div>
      </Header>

      <div className="native-modebar">
        <p>Choose an operation</p>
        <div className="grid w-full gap-2 sm:flex sm:flex-wrap">
          {modes.map((item) => (
            <button key={item} className={mode === item ? 'native-tab native-tab-active w-full sm:w-auto' : 'native-tab w-full sm:w-auto'} onClick={() => setModeDefaults(item)}>
              {item}
            </button>
          ))}
        </div>
      </div>

      <article className="native-card native-workspace">
        {isLookupMode ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{mode === 'Official Alphabet' ? 'Complete SIT alphabet' : 'Official SIT vocabulary'}</p>
              <span className="native-live">LIVE REGISTRY</span>
            </div>
            {mode === 'Official Alphabet' ? <AlphabetTable /> : <DictionarySearch showQuickCategories />}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
              <label className="text-sm font-semibold sm:text-base">
                {mode === 'Native Decoder' ? 'Native SIT sequence' : mode === 'Semantic Explorer' ? 'Concept' : 'Word or native concepts'}
              </label>
              <span className="native-live">LIVE INTERPRETER</span>
            </div>
            <textarea ref={inputRef} className="native-input native-input-long mt-4 min-h-28 sm:min-h-32" value={value} onChange={(e) => setValue(e.target.value)} placeholder={mode === 'Native Decoder' ? 'Paste SIT codes such as 6667677667767676 7666667676676776 ...' : mode === 'Semantic Explorer' ? 'Try HELLO, ?, or TRUST' : 'Try HELLO, WORLD! or [PLAN] -- BUILD.'} />
            {mode === 'Native Decoder' ? (
              <label className="mt-4 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={showCanonicalDecode}
                  onChange={(event) => setShowCanonicalDecode(event.target.checked)}
                />
                Show canonical token names
              </label>
            ) : null}
            {mode !== 'Native Decoder' ? (
              <div className="native-suggestions">
                {['HELLO, WORLD!', '@USER = VALUE', '<CODE> | #TAG', 'CODE\\FILE'].map((concept) => (
                  <button key={concept} type="button" onClick={() => setValue(concept)}>
                    {concept}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">Native result</p>
              <div className="flex flex-wrap items-center gap-2">
                {(mode === 'Native Encoder' || mode === 'Native Decoder') ? (
                  <button
                    type="button"
                    className="native-copy-btn"
                    onClick={() => handleCopy(output, mode === 'Native Encoder' ? 'Encoded output' : 'Decoded output')}
                  >
                    Copy result
                  </button>
                ) : null}
                <span className="text-xs opacity-70">Instant semantic resolution</span>
              </div>
            </div>
            <pre className="native-output native-output-long mt-2">{output || '-'}</pre>
            {copyStatus ? <p role="status" className="native-copy-status">{copyStatus}</p> : null}
            {canonicalDecodeOutput ? (
              <>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Canonical tokens</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="native-copy-btn"
                      onClick={() => handleCopy(canonicalDecodeOutput, 'Canonical tokens')}
                    >
                      Copy canonical
                    </button>
                    <span className="text-xs opacity-70">Diagnostic decode mode</span>
                  </div>
                </div>
                <pre className="native-output native-output-long mt-2">{canonicalDecodeOutput}</pre>
              </>
            ) : null}
          </>
        )}
      </article>
    </div>
  )
}
