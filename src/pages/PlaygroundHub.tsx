import { Suspense, lazy, useState } from 'react'

const LegacyPlayground = lazy(() => import('./PlaygroundPage'))
const NativePlayground = lazy(() => import('./NativePages').then((module) => ({ default: module.NativePlayground })))

export default function PlaygroundHub() {
  const [edition, setEdition] = useState<'1.0' | '2.0'>('1.0')

  return <div className="space-y-6">
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Playground edition">
        <button type="button" role="tab" aria-selected={edition === '1.0'} onClick={() => setEdition('1.0')} className={edition === '1.0' ? 'native-tab native-tab-active grow sm:grow-0' : 'native-tab grow sm:grow-0'}>SIT 1.0 · Legacy</button>
        <button type="button" role="tab" aria-selected={edition === '2.0'} onClick={() => setEdition('2.0')} className={edition === '2.0' ? 'native-tab native-tab-v2-active grow sm:grow-0' : 'native-tab native-tab-v2 grow sm:grow-0'}>SIT 2.0 · Native</button>
      </div>
      <p className="px-2 pt-3 text-sm text-slate-500 dark:text-slate-400">{edition === '1.0' ? 'ASCII, binary, batch conversion and compliance tools.' : 'Concept-first encoding, native decoding and semantic exploration.'}</p>
    </div>
    <Suspense fallback={<div className="native-card">Loading playground...</div>}>
      {edition === '1.0' ? <LegacyPlayground /> : <div className="native-v2"><NativePlayground /></div>}
    </Suspense>
  </div>
}
