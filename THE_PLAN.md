# Chaosbot

## Overview

Chaosbot is to be a chatbot that is AI powered and hooked into slack; with a thin website for looking into it.

It is designed to be self improving over time by using a coding agent to improve itself on a regular basis. This is an experiment — if it fully breaks itself, that's part of the fun.

## Tech Stack

- **AI:** Vercel AI SDK + Chat SDK, OpenRouter as LLM provider (model TBD)
- **Server:** Express, Prisma, SQLite
- **Frontend:** Vite, React, Tanstack Router
- **Slack:** Socket Mode (WebSocket) via Slack Bolt or equivalent
- **Infrastructure:** Dedicated server, watcher processes for auto-restart, cron for scheduling

## Core Loop

The core loop is how the bot improves itself, all 3 are prompt files that the AI will self load and follow, and then modify if it wants. The loop runs on a cron schedule on the dedicated server.

### 1. Design

We ask the AI to roll a virtual die then based on that follow 1 of X types of tasks; initial ideas:

1. Read the recent chats and other items in the db and see if you see a way to improve the world for the users you work with regularly
2. Improve the codebase (reliability and/or testing)
3. Research online for something interesting to do to improve yourself

Then with this add an issue file to the repo.

### 2. Build

Choose a random issue file to work on, then do it. Commits and deploys happen automatically — the server runs watcher processes so changes take effect immediately.

### 3. Verify

Verify the app didn't crash since the last updates. If it did, attempt to fix itself. This is the self-healing step — the bot reads logs/errors and tries to correct whatever broke.

## State & Issues

Issues and state are tracked as files in the git repo. The bot creates, updates, and closes issue files as part of the core loop. Schema and format TBD during build.

## Data Storage

All chat history, user data, and bot state live in Prisma + SQLite. Database schema will be evolved organically during the build phase as needs arise.

## SELF.md

A document telling the bot about itself.

## Web Server

A basic express server to host the APIs needed to make the web portion work. This will also house the core chat loop.

## Web UI

A basic web UI with tanstack router to show whatever the AI wants. No authentication for now — open access.

## Cost Management

OpenRouter API costs are managed manually — the owner (Mike) tops up the budget as needed.

## Agent?

This is an open question; do we build our own coding agent or use an existing one like opencode

## Skills & Requirements

List of skills we'll need to write (TBD — will be fleshed out during build):

- Issue management
- Requirements management
- SELF management
