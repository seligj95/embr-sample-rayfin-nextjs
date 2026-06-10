// Embr health-check target (see embr.yaml). Returns 200 when the Node app is
// up, and reports whether the Rayfin backend connection vars are present.
export const dynamic = 'force-dynamic';

export function GET() {
  const rayfinConfigured = Boolean(
    process.env.NEXT_PUBLIC_RAYFIN_API_URL &&
      process.env.NEXT_PUBLIC_RAYFIN_PUBLISHABLE_KEY
  );
  return Response.json({
    status: 'ok',
    rayfinConfigured,
    timestamp: new Date().toISOString(),
  });
}
