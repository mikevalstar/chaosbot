import PageHeader from '@/components/PageHeader';
import TodoPage from '@/pages/todo/TodoPage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/todo')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <PageHeader title={'Todo List'} />
      <TodoPage />
    </div>
  );
}
