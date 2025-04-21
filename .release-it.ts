import type { Config } from 'release-it';

export default {
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        disableRelease: false,
        inFile: 'CHANGELOG.md',
        publish: false,
      },
    },
  },
  npm: {
    publish: false,
    skipChecks: true,
  },
  git: {
    tagName: 'v${version}',
    push: true,
    commit: true,
    requireCleanWorkingDir: true,
    commitMessage: 'chore: release v${version}',
  },
} satisfies Config;
