import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AlphabetTable from '../components/AlphabetTable'
import DictionarySearch from '../components/DictionarySearch'
import GrammarCard from '../components/GrammarCard'
import { nativeDecode, nativeDictionary, nativeEncode } from '../data/native'

function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="native-hero">
      <p className="text-sm font-semibold uppercase tracking-[.28em] text-blue-600">{eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <div className="mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{children}</div>
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
  return (
    <div className="native-v2">
      <div className="space-y-8">
        <Header eyebrow="RFC-0002" title="Official SIT Alphabet">
          Each official token has a native code, semantic meaning and category. These fictional codes
          intentionally use only 6 and 7.
        </Header>
        <article className="native-card">
          <AlphabetTable />
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
      [item.name, item.meaning, item.code, item.examples.join(' ')].join(' ').toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const entry = useMemo(() => {
    if (!normalizedQuery) {
      return nativeDictionary.find((item) => item.name === 'HELLO') ?? nativeDictionary[0] ?? null
    }

    const upperQuery = query.trim().toUpperCase()
    const exactMatch = nativeDictionary.find((item) => item.name === upperQuery || item.code === query.trim())
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

  const output = useMemo(() => {
    if (mode === 'Native Encoder') {
      return nativeEncode(value)
    }
    if (mode === 'Native Decoder') {
      return nativeDecode(value)
    }
    if (mode === 'Semantic Explorer') {
      return nativeDictionary.find((item) => item.name === value.toUpperCase())?.description ?? 'Select an official concept.'
    }
    return ''
  }, [mode, value])

  const setModeDefaults = (selectedMode: Mode) => {
    setMode(selectedMode)
    if (selectedMode === 'Native Decoder') {
      setValue('6667677667767676')
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
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => (
            <button key={item} className={mode === item ? 'native-tab native-tab-active' : 'native-tab'} onClick={() => setModeDefaults(item)}>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="font-semibold">
                {mode === 'Native Decoder' ? 'Native SIT sequence' : mode === 'Semantic Explorer' ? 'Concept' : 'Word or native concepts'}
              </label>
              <span className="native-live">LIVE INTERPRETER</span>
            </div>
            <textarea className="native-input mt-4 min-h-32" value={value} onChange={(e) => setValue(e.target.value)} />
            {mode !== 'Native Decoder' ? (
              <div className="native-suggestions">
                {['HELLO', 'CREATE', 'JOY', 'SYSTEM'].map((concept) => (
                  <button key={concept} type="button" onClick={() => setValue(concept)}>
                    {concept}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm font-semibold">Native result</p>
              <span className="text-xs opacity-70">Instant semantic resolution</span>
            </div>
            <pre className="native-output mt-2">{output || '-'}</pre>
          </>
        )}
      </article>
    </div>
  )
}
