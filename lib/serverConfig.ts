// Server-side runtime config reader. Embr injects environment variables at
// RUNTIME (not build time), so we read them in a server component and pass the
// result to the client. This avoids relying on Next's build-time NEXT_PUBLIC_*
// inlining, which would be empty when vars are only present at runtime.
//
// We accept both the plain names (set on Embr via `embr variables set`) and the
// NEXT_PUBLIC_* names (written by `rayfin env --framework nextjs` for local dev).
export type RayfinConfig = {
  apiUrl: string;
  publishableKey: string;
  workspaceId: string;
  itemId: string;
  portalUrl: string;
};

function pick(...names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n];
    if (v && v.trim() !== '') return v;
  }
  return undefined;
}

export function getServerConfig(): RayfinConfig | null {
  const apiUrl = pick('RAYFIN_API_URL', 'NEXT_PUBLIC_RAYFIN_API_URL');
  const publishableKey = pick(
    'RAYFIN_PUBLISHABLE_KEY',
    'NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY'
  );
  const workspaceId = pick('FABRIC_WORKSPACE_ID', 'NEXT_PUBLIC_FABRIC_WORKSPACE_ID');
  const itemId = pick('FABRIC_ITEM_ID', 'NEXT_PUBLIC_FABRIC_ITEM_ID');
  const portalUrl =
    pick('FABRIC_PORTAL_URL', 'NEXT_PUBLIC_FABRIC_PORTAL_URL') ??
    'https://app.fabric.microsoft.com';

  if (!apiUrl || !publishableKey || !workspaceId || !itemId) return null;
  return { apiUrl, publishableKey, workspaceId, itemId, portalUrl };
}
