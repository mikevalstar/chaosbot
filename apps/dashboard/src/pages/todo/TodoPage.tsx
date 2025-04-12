import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Edit this array to add, remove, or modify todos
const TODOS = [
  {
    id: '1',
    text: 'Add more chaos features',
    completed: false,
  },
  {
    id: '2',
    text: 'Improve memory system',
    completed: false,
  },
  {
    id: '3',
    text: 'Add more personality traits',
    completed: false,
  },
];

export default function TodoPage() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <div className='px-4 lg:px-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-3xl font-bold tracking-tight'>
                  Developer Todo List
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <p className='text-muted-foreground'>
                    Edit the TODOs array in the code to add, remove, or modify todos.
                  </p>
                  <div className='space-y-2'>
                    {TODOS.map((todo) => (
                      <div key={todo.id} className='flex items-center gap-2 p-2 border rounded-md'>
                        <input
                          type='checkbox'
                          checked={todo.completed}
                          disabled
                          className='h-4 w-4'
                        />
                        <span
                          className={`${
                            todo.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                          {todo.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
