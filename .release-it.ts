import type { Config } from 'release-it';

export default {
  plugins: {
    'release-it-pnpm': {
      pnpm: {
        disableRelease: true,
        inFile: 'CHANGELOG.md',
        publish: true,
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
    skipChecks: true,
    release: true,
  },
} satisfies Config;
