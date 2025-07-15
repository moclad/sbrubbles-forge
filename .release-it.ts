import type { Config } from 'release-it';

export default {
  git: {
    commit: true,
    commitMessage: 'chore: release v${version}',
    push: true,
    requireCleanWorkingDir: false,
    tagName: 'v${version}',
  },
  github: {
    release: true,
  },
  npm: {
    publish: false,
  },
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        inFile: '',
        publishCommand: '',
      },
    },
  },
} satisfies Config;
