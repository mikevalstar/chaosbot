import PageHeader from '@/components/PageHeader';
import { CoreMemoryPage } from '@/pages/memory/Core';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/memory/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title={'Core Memory'} />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              <CoreMemoryPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
