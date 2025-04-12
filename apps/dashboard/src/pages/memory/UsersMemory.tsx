import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';

interface UserMemory {
  id: number;
  slackId: string;
  name: string;
  keyInfo: string;
}

async function fetchUsersMemory() {
  const response = await fetch('/api/users-memory');
  if (!response.ok) {
    throw new Error('Failed to fetch users memory');
  }
  return response.json();
}

export function UsersMemoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users-memory'],
    queryFn: fetchUsersMemory,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-1/4' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users Memory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-red-500'>Error loading users memory: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users Memory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {data.users.map((user: UserMemory) => (
            <Card key={user.id} className='bg-muted'>
              <CardHeader className='py-2'>
                <CardTitle className='text-lg'>{user.slackId}</CardTitle>
              </CardHeader>
              <CardContent className='py-2'>
                <pre className='whitespace-pre-wrap font-mono text-sm'>{user.keyInfo}</pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
