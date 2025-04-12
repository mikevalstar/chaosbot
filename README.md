# Chaosbot

## Setup

```sh
mkdir data; mkdir data/logs
```

### ENV

```sh
cd server/chaos; cp .env.example .env
```

### DB

```sh
cd server/chaos; npx drizzle-kit push
```

### Slack

1. Open https://api.slack.com/apps/new and choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of manifest.json into the text box that says _Paste your manifest code here_ (within the JSON tab) and click Next
4. Review the configuration and click Create

Fill out the following envc variables:

```
SLACK_APP_TOKEN=YOUR_SLACK_APP_TOKEN
SLACK_BOT_TOKEN=YOUR_SLACK_BOT_TOKEN
SLACK_BOT_SIGNING_SECRET=YOUR_SLACK_BOT_SIGNING_SECRET
SLACK_BOT_NAME=YOUR_SLACK_BOT_NAME
```

The signing secret can be retreived from the "basic information" tab

The app token can be created on the "basic information" tab, with the scope: `connections:write` it begins with `xapp`

The bot token can be retreived from the OAuth and Permissions tab (after installing to the workspace)

Then set the subscriptions (event subscriptions -> bot events): message.channels, message.groups, message.im, message.mpim

### OpenAI

Set your OpenAI token and org in the env file

### DB

```sh
cd server/chaos; npx drizzle-kit push
```
