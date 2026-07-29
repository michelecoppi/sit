import { useEffect, useMemo, useState } from 'react'
import { nativeDictionary } from '../data/native'
import { nativeProtocolApi, type NativeCapability, type NativeRegistry, type NativeVersion } from '../services/nativeProtocolService'

type NativeRegistryState = {
  source: 'loading' | 'live' | 'fallback'
  registry: NativeRegistry
}

const noCapabilities: NativeCapability[] = []

const fallbackRegistry: NativeRegistry = {
  defaultVersion: '2.0',
  registryVersion: 'offline-cache',
  registryChecksum: '',
  versions: [{
    version: '2.0',
    capabilities: ['registry', 'dictionary'] as NativeCapability[],
  }],
  entries: nativeDictionary,
}

export function useNativeRegistry() {
  const [state, setState] = useState<NativeRegistryState>({
    source: 'loading',
    registry: fallbackRegistry,
  })

  useEffect(() => {
    let mounted = true
    void nativeProtocolApi.registry()
      .then((registry) => {
        if (mounted) setState({ source: 'live', registry })
      })
      .catch(() => {
        if (mounted) setState({ source: 'fallback', registry: fallbackRegistry })
      })
    return () => { mounted = false }
  }, [])

  return useMemo(() => ({
    ...state,
    capabilitiesFor(version: NativeVersion) {
      return state.registry.versions.find((entry) => entry.version === version)?.capabilities ?? noCapabilities
    },
  }), [state])
}
