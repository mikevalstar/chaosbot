import logger from '../lib/log';

export async function githubCheckPRs() {
  logger.info('Checking PRs');
  const prsResponse = await fetch(
    'https://api.github.com/repos/mikevalstar/chaosbot/pulls?state=open&per_page=100',
  );

  const prs = await prsResponse.json();

  console.log(prs);

  setTimeout(githubCheckPRs, 60 * 1000);
}
