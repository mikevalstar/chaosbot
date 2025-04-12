import { Layout } from '@/components/layout';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

// Create a client
const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Outlet />
        <TanStackRouterDevtools />
      </Layout>
    </QueryClientProvider>
  ),
});
