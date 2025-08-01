import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      typography: () => ({
        llmchat: {
          css: {
            '--tw-prose-body': 'var(--color-fg)',
            '--tw-prose-headings': 'var(--color-fg)',
            '--tw-prose-lead': 'var(--color-fg)',
            '--tw-prose-links': 'var(--color-fg)',
            '--tw-prose-bold': 'var(--color-fg)',
            '--tw-prose-counters': 'var(--color-muted)',
            '--tw-prose-bullets': 'var(--color-muted)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-fg)',
            '--tw-prose-quote-borders': 'var(--color-border)',
            '--tw-prose-captions': 'var(--color-fg)',
            '--tw-prose-code': 'var(--color-fg)',
            '--tw-prose-pre-code': 'var(--color-fg)',
            '--tw-prose-pre-bg': 'var(--color-transparent)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border)',
            pre: {
              padding: 0,
            },
            code: {
              background: 'var(--color-bg-2)',
              padding: 'var(--spacing)',
              borderRadius: 'var(--radius-md)',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      }),
    },
  },

} satisfies Config
