import { Link } from '@tanstack/react-router';
import {
  ArrowUpCircleIcon,
  BarChart3,
  CheckSquare,
  Heart,
  Home,
  Moon,
  PiggyBank,
  Sun,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './ui/sidebar';

const navigation = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Events', href: '/events', icon: Heart },
      { name: 'TODO', href: '/todo', icon: CheckSquare },
    ],
  },
  {
    name: 'Bot',
    items: [
      { name: 'Memory', href: '/memory', icon: PiggyBank },
      { name: 'User Memory', href: '/memory/users', icon: PiggyBank },
      { name: 'Settings', href: '/settings', icon: Wallet },
      { name: 'Logs', href: '/logs', icon: BarChart3 },
    ],
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible='offcanvas' variant='inset'>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:!p-1.5'>
                <a href='#'>
                  <ArrowUpCircleIcon className='h-5 w-5' />
                  <span className='text-base font-semibold'>Chaos Inc.</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {navigation.map((section) => (
            <div key={section.name} className='mb-6'>
              <h3 className='px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                {section.name}
              </h3>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton asChild>
                        <Link to={item.href} className='flex items-center'>
                          <Icon className='h-5 w-5 mr-3' />
                          <span>{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </div>
          ))}
        </SidebarContent>
        <SidebarFooter>
          <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700'>
            <div className='text-sm text-gray-500'>© 2023 Acme Inc.</div>
            <button
              onClick={toggleDarkMode}
              className='p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800'
              aria-label='Toggle dark mode'>
              {isDark ? <Sun className='h-5 w-5' /> : <Moon className='h-5 w-5' />}
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
