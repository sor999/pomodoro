import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 [&>svg]:pointer-events-none transition-colors overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-hairline bg-surface-2 text-ink-muted',
        outline: 'border-hairline text-ink',
        success: 'border-transparent bg-success/15 text-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)
