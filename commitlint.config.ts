const config = {
	extends: ['@commitlint/config-conventional'],
	formatter: '@commitlint/format',
	rules: {
		'subject-case': [2, 'never'],
	},
};

export default config;
