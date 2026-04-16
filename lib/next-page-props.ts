export type RouteParams<TParams extends Record<string, string>> = Promise<TParams>;

export type RouteSearchParams<TSearchParams extends Record<string, string | undefined>> = Promise<TSearchParams>;

export type ParamsPageProps<TParams extends Record<string, string>> = {
  params: RouteParams<TParams>;
};

export type SearchPageProps<TSearchParams extends Record<string, string | undefined>> = {
  searchParams: RouteSearchParams<TSearchParams>;
};

export type ParamsAndSearchPageProps<
  TParams extends Record<string, string>,
  TSearchParams extends Record<string, string | undefined>,
> = {
  params: RouteParams<TParams>;
  searchParams: RouteSearchParams<TSearchParams>;
};
