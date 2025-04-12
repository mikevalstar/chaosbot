//import { Octokit } from 'octokit';
import { execSync } from 'child_process';

import logger from '../lib/log';

const validUsers = ['mikevalstar'];

export async function githubCheckPRs() {
  if (!process.env.GITHUB_TOKEN) {
    logger.warn('GITHUB_TOKEN is not set, this job will not run');
    return;
  }

  const { Octokit } = await import('octokit');

  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  logger.info('Checking PRs');
  const prsResponse = await fetch(
    'https://api.github.com/repos/mikevalstar/chaosbot/pulls?state=open&per_page=100',
  );

  const prs = await prsResponse.json();

  // for each one squash and merge
  for (const pr of prs) {
    if (validUsers.includes(pr.user.login)) {
      logger.info(`Squashing and merging PR ${pr.number}`);
      try {
        const data = await octokit.request('PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge', {
          owner: 'mikevalstar',
          repo: 'chaosbot',
          pull_number: pr.number,
          merge_method: 'squash',
          commit_title: pr.title,
          commit_message: 'Auto merged by the agent of chaos',
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
        });
        logger.info(`Squashed and merged PR ${pr.number}: ${data}`);

        // run the commands to pull the data, pnpm install, and drizzxlekit this bitch
        execSync(
          `cd ${process.env.FOLDER} ; git pull ; pnpm install ; cd server/chaos ; npx drizzle-kit push`,
        );
        execSync(`pm2 restart chaos`);
        execSync(`cd ${process.env.FOLDER}; cd apps/dashboard; pnpm run build`);
      } catch (error) {
        logger.error(`Error squashing and merging PR ${pr.number}: ${error}`);
      }
    }
  }

  setTimeout(githubCheckPRs, 60 * 1000);
}
