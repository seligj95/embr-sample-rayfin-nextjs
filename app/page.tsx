import NotesApp from '../components/NotesApp';
import { getServerConfig } from '../lib/serverConfig';

// Server component shell (rendered on the Embr Node runtime). It reads the
// Rayfin connection from runtime env (Embr injects vars at runtime) and passes
// it to the client component. The interactive Fabric auth + data access happen
// client-side via <NotesApp/>, which is Rayfin's supported model.
export const dynamic = 'force-dynamic';

export default function Home() {
  const config = getServerConfig();
  return (
    <main className="container">
      <h1>Rayfin × Embr — Notes Board</h1>
      <p className="sub">
        This page shell is server-rendered on Embr. The notes data is backed by a
        Fabric-managed Rayfin backend.
      </p>
      <NotesApp config={config} />
    </main>
  );
}
