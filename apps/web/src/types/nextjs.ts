import type { PropsWithChildren } from 'react'
import type { UnionToIntersection } from 'type-fest'

// Routes without dynamic segments receive `{}` params, not `never`
type RouteParams<TParams extends string> = [TParams] extends [never]
  ? Record<string, never>
  : UnionToIntersection<
      {
        [K in TParams]: Record<
          K extends `...${infer U}` ? U : K,
          K extends `...${string}` ? string[] : string
        >
      }[TParams]
    >

export interface DynamicPageProps<
  TParams extends string = never,
  TSearchParams extends string = never,
> {
  params: Promise<RouteParams<TParams>>
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  searchParams: Promise<{ [K in TSearchParams]?: string | string[] }>
}

// No search params in layouts
export interface DynamicLayoutProps<TParams extends string = never>
  extends PropsWithChildren {
  params: Promise<RouteParams<TParams>>
}
