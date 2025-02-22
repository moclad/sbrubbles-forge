import { toNextJsHandler as handler } from 'better-auth/next-js';

import { auth } from './server';

export function toNextJsHandler() {
  return handler(auth);
}
