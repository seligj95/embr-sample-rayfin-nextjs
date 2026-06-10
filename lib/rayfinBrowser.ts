'use client';

import { RayfinClient } from '@microsoft/rayfin-client';
import type { NotesSchema } from '../rayfin/data/schema';
import type { RayfinConfig } from './serverConfig';

// Browser-side Rayfin client. Fabric-managed Rayfin's supported model is
// client-side: the browser client owns the (opaque) session from interactive
// Fabric sign-in and uses it for data calls. Config is passed in from the
// server component (read from runtime env there), not read from NEXT_PUBLIC_*
// here — see lib/serverConfig.ts for why.
let client: RayfinClient<NotesSchema> | null = null;

export function getBrowserClient(config: RayfinConfig): RayfinClient<NotesSchema> {
  if (client) return client;
  client = new RayfinClient<NotesSchema>({
    baseUrl: config.apiUrl.endsWith('/') ? config.apiUrl : `${config.apiUrl}/`,
    publishableKey: config.publishableKey,
    authStorage: true,
  });
  return client;
}

export function fabricOptions(config: RayfinConfig) {
  return {
    workspaceId: config.workspaceId,
    projectId: config.itemId,
    fabricPortalUrl: config.portalUrl,
  };
}
