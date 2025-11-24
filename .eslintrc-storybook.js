module.exports = {
  // Storybook-specific ESLint rules
  overrides: [
    {
      files: ['**/*.stories.ts', '**/*.stories.js'],
      rules: {
        // Custom rule to prevent improper property assignment in stories
        'no-restricted-syntax': [
          'error',
          {
            selector:
              'TemplateLiteral[quasis.0.value.raw*="."][quasis.*.value.raw*="JSON.stringify"]',
            message:
              'Avoid using JSON.stringify for property assignment in story templates. Use Lit html template with .property=${value} instead.',
          },
          {
            selector:
              'TemplateLiteral[quasis.*.value.raw*=".options=\'"][quasis.*.value.raw*="${"]',
            message:
              "Use .options=${args.options} instead of .options='${JSON.stringify(args.options)}' in Lit html templates.",
          },
          {
            selector: 'TemplateLiteral[quasis.*.value.raw*=".items=\'"][quasis.*.value.raw*="${"]',
            message:
              "Use .items=${args.items} instead of .items='${JSON.stringify(args.items)}' in Lit html templates.",
          },
          {
            selector: 'TemplateLiteral[quasis.*.value.raw*=".data=\'"][quasis.*.value.raw*="${"]',
            message:
              "Use .data=${args.data} instead of .data='${JSON.stringify(args.data)}' in Lit html templates.",
          },
        ],
        // Enforce html import when using templates
        'import/no-unresolved': ['error', { ignore: ['^lit$'] }],
      },
    },
  ],
};
