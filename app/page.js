import Sidebar from '@/components/Sidebar';
import EventTypesList from '@/components/EventTypesList';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-auto">
        <EventTypesList />
      </main>
    </div>
  );
}
