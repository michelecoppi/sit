import { useEffect, useMemo, useState } from 'react'
import { nativeDictionary, nativeCategories } from '../data/native'

export default function AlphabetTable() {
  const [filter, setFilter] = useState('')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 10

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

  const rows = useMemo(() => nativeDictionary.filter((entry) => {
    const matchesCategory = category === 'All' || entry.category === category
    const matchesFilter = `${entry.name} ${entry.meaning} ${entry.code}`.toLowerCase().includes(filter.toLowerCase())
    return matchesCategory && matchesFilter
  }), [category, filter])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const smartPages = buildSmartPages(currentPage, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [currentPage, rows])

  useEffect(() => {
    setPage(1)
  }, [filter, category])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  return <div className="space-y-4">
    <div className="flex flex-wrap gap-3">
      <input className="native-input" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search symbols, meanings, or codes" />
      <div className="flex flex-wrap gap-2">{['All', ...nativeCategories].map((item) => <button key={item} type="button" className={category === item ? 'native-tab native-tab-active' : 'native-tab'} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    {rows.length ? <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500"><p>Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, rows.length)} of {rows.length} entries</p><p>Page {currentPage} / {totalPages}</p></div> : null}
    <div className="space-y-3 md:hidden">
      {paginatedRows.map((entry) => (
        <article key={entry.id} className="native-card">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold">{entry.name}</h3>
            <span className="native-pill">{entry.category}</span>
          </div>
          <code className="native-code mt-3 inline-block">{entry.code}</code>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{entry.meaning}</p>
          <p className="mt-2 text-sm text-slate-500">Example: {entry.examples[0]}</p>
        </article>
      ))}
    </div>
    <div className="hidden overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 md:block"><table className="w-full min-w-[740px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500 dark:bg-slate-950"><tr><th>Name</th><th>Native code</th><th>Meaning</th><th>Category</th><th>Example</th></tr></thead><tbody>{paginatedRows.map((entry) => <tr key={entry.id} className="border-t border-slate-200 dark:border-slate-800"><td className="font-semibold">{entry.name}</td><td><code className="native-code">{entry.code}</code></td><td>{entry.meaning}</td><td><span className="native-pill">{entry.category}</span></td><td>{entry.examples[0]}</td></tr>)}</tbody></table></div>
    {rows.length > pageSize ? <div className="flex flex-wrap items-center justify-center gap-2"><button type="button" className="native-tab" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>{smartPages.map((item, index) => item === '...' ? <span key={`ellipsis-${index}`} className="px-2 text-slate-500">...</span> : <button key={item} type="button" className={currentPage === item ? 'native-tab native-tab-active' : 'native-tab'} onClick={() => setPage(item)}>{item}</button>)}<button type="button" className="native-tab" disabled={currentPage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button></div> : null}
    {!rows.length ? <p className="text-slate-500">No official native entry found.</p> : null}
  </div>
}
