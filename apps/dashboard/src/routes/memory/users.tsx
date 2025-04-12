import PageHeader from '@/components/PageHeader';
import { UsersMemoryPage } from '@/pages/memory/UsersMemory';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/memory/users')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title={'Memories of Users'} />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              <UsersMemoryPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
