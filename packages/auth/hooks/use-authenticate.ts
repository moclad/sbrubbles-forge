import { useContext, useEffect } from 'react';

import { AuthUIContext } from '../lib/auth-ui-provider';

interface AuthenticateOptions {
  enabled?: boolean;
}

export function useAuthenticate(options?: AuthenticateOptions) {
  const { enabled = true } = options ?? {};

  const {
    hooks: { useSession },
    basePath,
    replace,
  } = useContext(AuthUIContext);

  const { data: sessionData, isPending } = useSession();

  useEffect(() => {
    if (!enabled || isPending || sessionData) {
      return;
    }

    replace(
      `${basePath}/sign-in}?redirectTo=${window.location.href.replace(window.location.origin, '')}`
    );
  }, [isPending, sessionData, basePath, replace, enabled]);
}
