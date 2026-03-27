# Slack Bot Credentials Setup

This guide walks through obtaining all the credentials needed to run a Slack bot using [Vercel's AI SDK](https://sdk.vercel.ai/).

## Credentials Overview

You will need the following environment variables:

| Variable | Format | Purpose |
|---|---|---|
| `SLACK_BOT_TOKEN` | `xoxb-...` | Authenticates your bot for Slack API calls |
| `SLACK_SIGNING_SECRET` | hex string | Verifies incoming requests are actually from Slack |
| `SLACK_APP_TOKEN` | `xapp-...` | Enables Socket Mode (WebSocket connection to Slack) |
| `OPENROUTER_API_KEY` | `sk-or-...` | Authenticates with OpenRouter for the AI SDK |

## Step 1: Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Choose **From scratch**
4. Enter an app name and select the workspace you want to install it to
5. Click **Create App**

You'll land on the **Basic Information** page for your new app.

## Step 2: Get the Signing Secret

1. On the **Basic Information** page, scroll to **App Credentials**
2. Copy the **Signing Secret**
3. Save it as `SLACK_SIGNING_SECRET` in your `.env` file

## Step 3: Enable Socket Mode

Socket Mode lets your bot connect via WebSocket instead of requiring a public HTTP endpoint. This is ideal for local development and private deployments.

1. In the left sidebar, go to **Socket Mode**
2. Toggle **Enable Socket Mode** on
3. You'll be prompted to create an **App-Level Token**
   - Name it something like `socket-token`
   - Add the scope `connections:write`
   - Click **Generate**
4. Copy the token (starts with `xapp-`)
5. Save it as `SLACK_APP_TOKEN` in your `.env` file

> **Note:** If you plan to deploy behind a public URL (e.g. on Vercel), you can skip Socket Mode and use HTTP mode instead. In that case you won't need `SLACK_APP_TOKEN`, but you will need to configure a **Request URL** under **Event Subscriptions**.

## Step 4: Configure Bot OAuth Scopes

1. In the left sidebar, go to **OAuth & Permissions**
2. Scroll to **Scopes** > **Bot Token Scopes**
3. Add the following scopes:

| Scope | Purpose |
|---|---|
| `app_mentions:read` | Receive events when the bot is @mentioned |
| `chat:write` | Send messages to channels and DMs |
| `channels:history` | Read message history in public channels |
| `channels:read` | View basic channel info |
| `groups:history` | Read message history in private channels |
| `im:history` | Read DM message history |
| `im:read` | View basic DM info |
| `mpim:history` | Read group DM history |
| `users:read` | Look up user info (names, avatars, etc.) |

Add more scopes as needed for your use case (e.g. `reactions:write`, `files:read`).

## Step 5: Install the App to Your Workspace

1. Still on **OAuth & Permissions**, scroll to the top
2. Click **Install to Workspace**
3. Review the permissions and click **Allow**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Save it as `SLACK_BOT_TOKEN` in your `.env` file

## Step 6: Subscribe to Events

1. In the left sidebar, go to **Event Subscriptions**
2. Toggle **Enable Events** on
3. Under **Subscribe to bot events**, add:
   - `app_mention` — triggers when someone @mentions the bot
   - `message.channels` — messages in public channels
   - `message.groups` — messages in private channels
   - `message.im` — direct messages
   - `message.mpim` — group DMs
4. Click **Save Changes**

After changing event subscriptions, Slack may ask you to reinstall the app. Do so if prompted.

## Step 7: Get an OpenRouter API Key

The Vercel AI SDK needs an LLM provider. We use [OpenRouter](https://openrouter.ai/) which gives access to many models (OpenAI, Anthropic, Google, etc.) through a single API.

1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Click **Create Key**
3. Copy the key
4. Save it as `OPENROUTER_API_KEY` in your `.env` file

## Final `.env` File

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
OPENROUTER_API_KEY=sk-or-your-openrouter-key
```

Make sure `.env` is in your `.gitignore`.

## Vercel AI SDK Packages

Install the core SDK and the OpenRouter provider:

```bash
pnpm add ai @openrouter/ai-sdk-provider
```

## Useful Links

- [Slack API Apps Dashboard](https://api.slack.com/apps)
- [Slack Token Types](https://docs.slack.dev/authentication/tokens/)
- [Socket Mode vs HTTP](https://docs.slack.dev/apis/events-api/comparing-http-socket-mode/)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/)
- [Vercel AI SDK Slackbot Guide](https://sdk.vercel.ai/docs/guides/slackbot)
- [Vercel AI SDK Slackbot Template](https://vercel.com/templates/other/ai-sdk-slackbot)
- [OpenRouter](https://openrouter.ai/)
- [OpenRouter AI SDK Provider](https://openrouter.ai/docs/frameworks/vercel-ai-sdk)
