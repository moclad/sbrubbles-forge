import { toNextJsHandler as handler } from 'better-auth/next-js';

import { auth } from './server';

export function toNextJsHandler() {
  console.log('toNextJsHandler');
  return handler(auth);
}
