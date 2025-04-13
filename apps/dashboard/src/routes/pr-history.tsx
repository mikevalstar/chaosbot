import PageHeader from '@/components/PageHeader';
import { PRHistoryPage } from '@/pages/prhistory/PRHistory';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/pr-history')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title={'PR History'} />
      <div className='flex flex-1 flex-col'>
        <div className='@container/main flex flex-1 flex-col gap-2'>
          <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
            <div className='px-4 lg:px-6'>
              <PRHistoryPage />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
