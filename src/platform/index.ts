import { createElectronPlatform, type NativeApi } from './electron'
import type { Platform } from './types'
import { createWebPlatform } from './web'

export function detectPlatform(): Platform {
  const api = (window as unknown as { cymdNative?: NativeApi }).cymdNative
  return api ? createElectronPlatform(api) : createWebPlatform()
}

export type { Platform } from './types'
