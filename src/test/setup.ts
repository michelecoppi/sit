/// <reference types="node" />
import { webcrypto } from 'node:crypto'
import 'fake-indexeddb/auto'
import '@testing-library/jest-dom'

if (!globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', { value: webcrypto.subtle, configurable: true })
}
