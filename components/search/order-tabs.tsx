import Link from 'next/link'
import { TAB_TRIGGER, tabsListVariants } from '@/components/ui/tabs'
import { cn } from '@/lib/utils/cn'

/**
 * Which way a list is ordered — Featured, Hot, Popular, New — as tabs whose
 * state is the URL: each is a link that keeps the rest of the query, so an
 * order can be shared and an agent can open the same list. The look is the
 * Tabs component's (`TAB_TRIGGER`).
 */
export function OrderTabs({
  orders,
  value,
  label,
}: {
  orders: ReadonlyArray<{ value: string; label: string; href: string }>
  value: string
  label: string
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        tabsListVariants({ variant: 'default' }),
        'w-full sm:w-fit'
      )}
      data-variant="default"
    >
      {orders.map((order) => {
        const isActive = order.value === value
        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            className={cn(TAB_TRIGGER, 'px-2.5')}
            data-active={isActive ? '' : undefined}
            href={order.href}
            key={order.value}
            scroll={false}
          >
            {order.label}
          </Link>
        )
      })}
    </nav>
  )
}
