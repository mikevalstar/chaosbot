//import { Octokit } from 'octokit';
import { prHistory } from '@/db/schema';
import db from '@/lib/db';
import { exec, execSync } from 'child_process';
import { eq } from 'drizzle-orm';

import logger from '../lib/log';

const validUsers = ['mikevalstar', 'especially', 'americobarros'];

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
    storePrDetails(pr);

    if (
      !pr.draft &&
      pr.base.ref === 'main' &&
      pr.state === 'open' &&
      validUsers.includes(pr.user.login.toLowerCase())
    ) {
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
        setMerged(pr.number);

        // run the commands to pull the data, pnpm install, and drizzle kit this bitch
        execSync(
          `cd ${process.env.FOLDER} ; git checkout pnpm-lock.yaml ; git pull ; pnpm install ; cd server/chaos ; npx drizzle-kit push`,
        );
        execSync(`cd ${process.env.FOLDER}; cd apps/dashboard; pnpm run build`);
        exec(`pm2 restart chaos`); // needs to be last, causes a restart of the app
      } catch (error) {
        logger.error(`Error squashing and merging PR ${pr.number}: ${error}`);
      }
    }
  }

  setTimeout(githubCheckPRs, 10 * 60 * 1000);
}

async function storePrDetails(pr: any) {
  const prDetails = await db.select().from(prHistory).where(eq(prHistory.prId, pr.id));
  if (prDetails.length > 0) {
    // update the prHistory
    await db
      .update(prHistory)
      .set({
        title: pr.title || 'unknown',
        url: pr.html_url || 'unknown',
        updatedAt: pr.updated_at || 'unknown',
        authorAssociation: pr.author_association || 'unknown',
        authorLogin: pr.user?.login || 'unknown',
        authorAvatarUrl: pr.user?.avatar_url || 'unknown',
        authorUrl: pr.user?.url || 'unknown',
        state: pr.state || 'unknown',
        fromBranch: pr.head.ref || 'unknown',
        toBranch: pr.base.ref || 'unknown',
      })
      .where(eq(prHistory.prId, pr.id));
  } else {
    await db.insert(prHistory).values({
      prId: pr.id,
      title: pr.title || 'unknown',
      url: pr.html_url || 'unknown',
      createdAt: pr.created_at || 'unknown',
      updatedAt: pr.updated_at || 'unknown',
      authorAssociation: pr.author_association || 'unknown',
      authorLogin: pr.user?.login || 'unknown',
      authorAvatarUrl: pr.user?.avatar_url || 'unknown',
      authorUrl: pr.user?.url || 'unknown',
      state: pr.state || 'unknown',
      fromBranch: pr.head.ref || 'unknown',
      toBranch: pr.base.ref || 'unknown',
    });
  }
}

async function setMerged(prId: number) {
  await db
    .update(prHistory)
    .set({
      state: 'merged',
    })
    .where(eq(prHistory.prId, prId));
}
