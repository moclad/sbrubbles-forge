import type { Config } from 'release-it';

export default {
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        disableRelease: false,
        inFile: 'CHANGELOG.md',
        publish: true,
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
    requireCleanWorkingDir: false,
    commitMessage: 'chore: release v${version}',
  },
  github: {
    host: 'forgejo.speebles.duckdns.org',
    release: false,
    releaseName: 'v${version}',
    assets: [
      {
        path: 'CHANGELOG.md',
        label: 'CHANGELOG',
      },
    ],
  },
} satisfies Config;
