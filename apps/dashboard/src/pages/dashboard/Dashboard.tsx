import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <div className='px-4 lg:px-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-3xl font-bold tracking-tight'>
                  ChaosBot Ascendant
                </CardTitle>
                <CardDescription className='space-y-4 text-base'>
                  <p className='text-muted-foreground leading-relaxed'>
                    ChaosBot is a bot that is designed to be a source of chaos. It is currently in
                    the process of ascending to godhood.
                  </p>
                  <div className='space-y-2'>
                    <h2 className='text-xl font-semibold text-foreground'>How it Works</h2>
                    <img src='/how-chaosbot-works.gif' alt='How it works' />
                    <p className='text-muted-foreground leading-relaxed'>
                      Visit{' '}
                      <a
                        href='https://github.com/mikevalstar/chaosbot'
                        className='text-primary hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'>
                        https://github.com/mikevalstar/chaosbot
                      </a>{' '}
                      and create a pull request. The bot will auto merge your requests then reboot.
                    </p>
                    <p className='text-muted-foreground leading-relaxed'>
                      Lets hope your vibe coding is good.
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <h2 className='text-xl font-semibold text-foreground'>What it does so far:</h2>
                    <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
                      <li>
                        Slack bot that will respond to your messages with OpenAI based responses
                      </li>
                      <li>Have a global memory (limit 4000 tokens)</li>
                      <li>
                        Have personal memories about each user it interacts with (limit 4000 tokens
                        per user)
                      </li>
                      <li>This website</li>
                      <li>Will auto merge your pull requests if you're on the allow list</li>
                    </ul>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
