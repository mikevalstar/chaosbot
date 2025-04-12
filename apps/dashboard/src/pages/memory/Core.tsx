import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

async function fetchCoreMemory() {
  const response = await fetch('/api/core-memory');
  if (!response.ok) {
    throw new Error('Failed to fetch core memory');
  }
  return response.json();
}

export function CoreMemoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['core-memory'],
    queryFn: fetchCoreMemory,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Core Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4 mt-2' />
          <Skeleton className='h-4 w-1/2 mt-2' />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Core Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-red-500'>Error loading core memory: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className='whitespace-pre-wrap font-mono text-sm'>{data.memory}</pre>
      </CardContent>
    </Card>
  );
}
