import { useSyncExternalStore } from 'react';

function subscribe() {
  // biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
  return () => {};
}

export function useIsHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
