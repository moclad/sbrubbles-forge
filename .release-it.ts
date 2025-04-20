import type { Config } from 'release-it';

export default {
  $schema: 'https://unpkg.com/release-it/schema/release-it.json',
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        disableRelease: true,
        inFile: 'CHANGELOG.md',
        publish: false,
      },
    },
    '@release-it/conventional-changelog': {
      infile: 'CHANGELOG.md',
      preset: {
        name: 'conventionalcommits',
        types: [
          {
            type: 'feat',
            section: 'Features',
          },
          {
            type: 'fix',
            section: 'Bug Fix',
          },
          {
            type: 'ci',
            section: 'CI/CD',
          },
          {
            type: 'cd',
            section: 'CI/CD',
          },
          {
            type: 'chore',
            section: 'Chores',
          },
        ],
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
    host: 'forgejo.speebles.duckdns.org',
    release: true,
    releaseName: 'v${version}',
    assets: [
      {
        path: 'CHANGELOG.md',
        label: 'CHANGELOG',
      },
    ],
  },
} satisfies Config;
