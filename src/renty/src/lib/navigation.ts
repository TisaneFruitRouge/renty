import { useLocation, useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

export function usePathname() {
  return useLocation().pathname;
}

export function useSearchParams() {
  const [searchParams] = useRouterSearchParams();
  return searchParams;
}

export function useRouter() {
  const navigate = useNavigate();

  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    refresh: () => undefined,
    back: () => navigate(-1),
    forward: () => navigate(1),
  };
}
