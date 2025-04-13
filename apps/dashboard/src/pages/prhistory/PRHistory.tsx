import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface PRHistory {
  id: number;
  prId: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  authorAssociation: string;
  authorLogin: string;
  authorAvatarUrl: string;
  authorUrl: string;
  state: string;
  fromBranch: string;
  toBranch: string;
}

async function fetchPRHistory() {
  const response = await fetch('/api/pr-history');
  if (!response.ok) {
    throw new Error('Failed to fetch PR history');
  }
  return response.json();
}

export function PRHistoryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pr-history'],
    queryFn: fetchPRHistory,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>PR History</CardTitle>
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
          <CardTitle>PR History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-red-500'>Error loading PR history: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>PR History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PR</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Branches</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.prs.map((pr: PRHistory) => (
              <TableRow key={pr.id}>
                <TableCell>
                  <a
                    href={pr.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='font-medium hover:underline'>
                    {pr.title}
                  </a>
                </TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <img
                      src={pr.authorAvatarUrl}
                      alt={pr.authorLogin}
                      className='h-5 w-5 rounded-full'
                    />
                    {pr.authorUrl ? (
                      <a
                        href={pr.authorUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm hover:underline'>
                        {pr.authorLogin}
                      </a>
                    ) : (
                      <span className='text-sm'>{pr.authorLogin}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      pr.state === 'merged'
                        ? 'bg-green-100 text-green-800'
                        : pr.state === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}>
                    {pr.state}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm text-muted-foreground'>
                    {pr.fromBranch} → {pr.toBranch}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='text-sm text-muted-foreground'>
                    {dayjs(pr.updatedAt).fromNow()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
