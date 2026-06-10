import NotesApp from '../components/NotesApp';

// Server component shell (rendered on the Embr Node runtime). The interactive
// data + Fabric auth happen client-side via <NotesApp/>, which is Rayfin's
// supported model for a Fabric-managed backend.
export default function Home() {
  return (
    <main className="container">
      <h1>Rayfin × Embr — Notes Board</h1>
      <p className="sub">
        This page shell is server-rendered on Embr. The notes data is backed by a
        Fabric-managed Rayfin backend.
      </p>
      <NotesApp />
    </main>
  );
}
