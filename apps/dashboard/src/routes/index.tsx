import PageHeader from '@/components/PageHeader';
import Dashboard from '@/pages/dashboard/Dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  return (
    <div>
      <PageHeader title={'Dashboard'} />
      <Dashboard />
    </div>
  );
}
