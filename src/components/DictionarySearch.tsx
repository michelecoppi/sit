import { useEffect, useMemo, useState } from 'react'
import { nativeCategories, nativeDictionary } from '../data/native'

type DictionarySearchProps = {
  showQuickCategories?: boolean
}

export default function DictionarySearch({ showQuickCategories = false }: DictionarySearchProps) {
  const [query, setQuery] = useState('HELLO')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 4

  const buildSmartPages = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, index) => index + 1)
    }

    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total] as const
    }

    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total] as const
    }

    return [1, '...', current - 1, current, current + 1, '...', total] as const
  }

  const results = useMemo(() => nativeDictionary.filter((entry) => {
    const matchesQuery = `${entry.name} ${entry.meaning} ${entry.category} ${entry.code}`.toLowerCase().includes(query.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory
    return matchesQuery && matchesCategory
  }), [query, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(results.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const smartPages = buildSmartPages(currentPage, totalPages)
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return results.slice(start, start + pageSize)
  }, [currentPage, results])

  useEffect(() => {
    setPage(1)
  }, [query, selectedCategory])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return <div>
    <input className="native-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search HELLO, emotion, or 6667..." />
    {showQuickCategories ? <div className="mt-3 flex flex-wrap gap-2">{['All', ...nativeCategories].map((category) => <button key={category} type="button" className={selectedCategory === category ? 'native-tab native-tab-active' : 'native-tab'} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div> : null}
    {results.length ? <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><p>Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, results.length)} of {results.length} entries</p><p className="text-xs sm:text-sm">Page {currentPage} / {totalPages}</p></div> : null}
    <div className="mt-5 grid gap-4 md:grid-cols-2">{paginatedResults.map((entry) => <article key={entry.id} className="native-card"><div className="flex justify-between gap-3"><h2 className="text-xl font-semibold">{entry.name}</h2><span className="native-pill">{entry.category}</span></div><code className="native-code mt-4 inline-block">{entry.code}</code><p className="mt-4 text-slate-600 dark:text-slate-300">{entry.description}</p><p className="mt-3 text-sm text-slate-500">Usage: {entry.usage}</p></article>)}</div>
    {results.length > pageSize ? <div className="mt-6 flex flex-wrap items-center justify-center gap-2"><button type="button" className="native-tab" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>{smartPages.map((item, index) => item === '...' ? <span key={`ellipsis-${index}`} className="px-2 text-slate-500">...</span> : <button key={item} type="button" className={currentPage === item ? 'native-tab native-tab-active' : 'native-tab'} onClick={() => setPage(item)}>{item}</button>)}<button type="button" className="native-tab" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button></div> : null}
    {!results.length ? <p className="mt-6 text-slate-500">No official native entry found.</p> : null}
  </div>
}
