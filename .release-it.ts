import type { Config } from 'release-it';

export default {
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        disableRelease: false,
        inFile: 'CHANGELOG.md',
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
    release: false,
  },
} satisfies Config;
