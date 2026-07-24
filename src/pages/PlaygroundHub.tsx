import { Suspense, lazy, useState } from 'react'
import { BeakerIcon, BoltIcon, CommandLineIcon } from '@heroicons/react/24/outline'

const LegacyPlayground = lazy(() => import('./PlaygroundPage'))
const NativePlayground = lazy(() => import('./NativePages').then((module) => ({ default: module.NativePlayground })))

export default function PlaygroundHub() {
  const [edition, setEdition] = useState<'1.0' | '2.0'>('1.0')

  return <div className="space-y-6">
    <section className="playground-header">
      <div>
        <p><BeakerIcon aria-hidden="true" /> Interactive laboratory</p>
        <h1>Encode. Decode. <span>Experiment.</span></h1>
        <div className="playground-benefits">
          <span><BoltIcon aria-hidden="true" /> Instant conversion</span>
          <span><CommandLineIcon aria-hidden="true" /> Runs locally</span>
        </div>
      </div>
      <div className="playground-switcher">
        <span>Choose an edition</span>
        <div role="tablist" aria-label="Playground edition">
          <button type="button" role="tab" aria-selected={edition === '1.0'} onClick={() => setEdition('1.0')} className={edition === '1.0' ? 'native-tab native-tab-active' : 'native-tab'}>SIT 1.0 · Legacy</button>
          <button type="button" role="tab" aria-selected={edition === '2.0'} onClick={() => setEdition('2.0')} className={edition === '2.0' ? 'native-tab native-tab-v2-active' : 'native-tab native-tab-v2'}>SIT 2.0 · Native</button>
        </div>
        <p>{edition === '1.0' ? 'ASCII, binary, batch conversion and compliance tools.' : 'Concept-first encoding, native decoding and semantic exploration.'}</p>
      </div>
    </section>
    <div className="playground-workspace">
      <div className="workspace-status">
        <span><i aria-hidden="true" /> Workspace ready</span>
        <span>{edition === '1.0' ? 'LEGACY ENGINE' : 'NATIVE ENGINE'}</span>
      </div>
      <Suspense fallback={<div className="route-loader"><span className="route-loader-mark" aria-hidden="true"><i>6</i><i>7</i></span><span><strong>Loading playground</strong><small>Preparing conversion tools…</small></span></div>}>
        {edition === '1.0' ? <LegacyPlayground /> : <div className="native-v2"><NativePlayground /></div>}
      </Suspense>
    </div>
  </div>
}
