import { useSyncExternalStore } from 'react'

const noSubscription = () => () => {}

/**
 * False on the server and during hydration, true afterwards. Anything that depends on the
 * browser (saved progress, live simulations) should wait for it, so the first render
 * matches the pre-rendered HTML.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  )
