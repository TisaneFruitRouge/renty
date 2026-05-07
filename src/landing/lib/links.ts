export function appHref(path: `/${string}`) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");

  return appUrl ? `${appUrl}${path}` : path;
}
