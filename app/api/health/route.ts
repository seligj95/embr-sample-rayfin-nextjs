import { getServerConfig } from '../../../lib/serverConfig';

// Embr health-check target (see embr.yaml). Returns 200 when the Node app is
// up, and reports whether the Rayfin backend connection is configured.
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    status: 'ok',
    rayfinConfigured: getServerConfig() !== null,
    timestamp: new Date().toISOString(),
  });
}
