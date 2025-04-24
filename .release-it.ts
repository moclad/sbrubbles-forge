import type { Config } from 'release-it';

export default {
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        inFile: '',
        publishCommand: '',
      },
    },
  },
  npm: {
    publish: false,
  },
  git: {
    tagName: 'v${version}',
    push: true,
    commit: true,
    requireCleanWorkingDir: false,
    commitMessage: 'chore: release v${version}',
  },
  github: {
    release: true,
  },
} satisfies Config;
