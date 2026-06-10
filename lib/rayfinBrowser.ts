'use client';

import { RayfinClient } from '@microsoft/rayfin-client';
import type { NotesSchema } from '../rayfin/data/schema';

// Browser-side Rayfin client. Fabric-managed Rayfin's supported model is
// client-side: the browser client owns the (opaque) session from interactive
// Fabric sign-in and uses it for data calls. The publishable key is public by
// design and exposed via NEXT_PUBLIC_* (client-visible) env vars.
let client: RayfinClient<NotesSchema> | null = null;

export function getBrowserClient(): RayfinClient<NotesSchema> {
  if (client) return client;

  const baseUrl = process.env.NEXT_PUBLIC_RAYFIN_API_URL;
  const publishableKey = process.env.NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY;
  if (!baseUrl || !publishableKey) {
    throw new Error(
      'Missing Rayfin config. Set NEXT_PUBLIC_RAYFIN_API_URL and ' +
        'NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY (run `rayfin up`, then `rayfin env ' +
        '--framework nextjs`, or set them on Embr via `embr variables set`).'
    );
  }

  client = new RayfinClient<NotesSchema>({
    baseUrl: baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`,
    publishableKey,
    authStorage: true,
  });
  return client;
}

export function fabricOptions() {
  const workspaceId = process.env.NEXT_PUBLIC_FABRIC_WORKSPACE_ID;
  const projectId = process.env.NEXT_PUBLIC_FABRIC_ITEM_ID;
  const fabricPortalUrl =
    process.env.NEXT_PUBLIC_FABRIC_PORTAL_URL ?? 'https://app.fabric.microsoft.com';

  if (!workspaceId || !projectId) {
    throw new Error(
      'Missing Fabric config. Set NEXT_PUBLIC_FABRIC_WORKSPACE_ID and ' +
        'NEXT_PUBLIC_FABRIC_ITEM_ID.'
    );
  }
  return { workspaceId, projectId, fabricPortalUrl };
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_RAYFIN_API_URL &&
      process.env.NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY &&
      process.env.NEXT_PUBLIC_FABRIC_WORKSPACE_ID &&
      process.env.NEXT_PUBLIC_FABRIC_ITEM_ID
  );
}
