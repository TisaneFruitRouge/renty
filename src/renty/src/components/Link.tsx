import { forwardRef } from "react";
import { Link as RouterLink, type LinkProps as RouterLinkProps } from "react-router-dom";

type Href = string | { pathname?: string; query?: Record<string, string | number | boolean | null | undefined> };

type LinkProps = Omit<RouterLinkProps, "to"> & {
  href: Href;
  prefetch?: boolean;
};

function hrefToString(href: Href) {
  if (typeof href === "string") return href;

  const pathname = href.pathname ?? "/";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(href.query ?? {})) {
    if (value !== null && value !== undefined) params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ href, prefetch: _prefetch, ...props }, ref) => {
  return <RouterLink ref={ref} to={hrefToString(href)} {...props} />;
});

Link.displayName = "Link";

export default Link;
