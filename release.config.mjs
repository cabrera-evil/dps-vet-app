/**
 * @see https://semantic-release.gitbook.io/semantic-release/usage/configuration
 * @type {import('semantic-release').GlobalConfig}
 */
const config = {
	branches: ['master', { name: 'develop', prerelease: 'beta' }],
	tagFormat: 'v${version}',
	plugins: [
		['@semantic-release/commit-analyzer', { preset: 'conventionalcommits' }],
		[
			'@semantic-release/release-notes-generator',
			{ preset: 'conventionalcommits' },
		],
		['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
		'@cabrera-evil/semantic-release-expo',
		[
			'@semantic-release/npm',
			{
				// INFO: Set to true only if you intend to publish this package to the public npm registry
				npmPublish: false,
				tarballDir: 'dist',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: ['CHANGELOG.md', 'app.json', 'package.json', 'pnpm-lock.yaml'],
				message:
					'chore(release): ${nextRelease.version}\n\n${nextRelease.notes}',
			},
		],
		[
			'@semantic-release/github',
			{
				assets: ['release-artifacts/*.apk'],
			},
		],
		'semantic-release-export-data',
	],
};

export default config;
