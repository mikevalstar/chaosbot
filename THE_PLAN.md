# Chaosbot

## Overview

Chaosbot is to be a chatbot that is AI powered and hooked into slack; with a thin website for looking into it.

It is designed to be self improving over time by using a coding agent to improve itself on a regular basis. 

## Core Loop
The core loop is how the bot improves itself, all 3 are prompt files that the AI will self load and follow, and then modify if it wants.

### 1. Design

We ask the AI to roll a virtual die then based on that follow 1 of X types of tasks; initial ideas:

1. Read the recent chats and other items in the db and see if you see a way to improve the world for the users you work with regularly
2. Improve the codebase (reliability and/or testing)
3. Research online for something interesting to do to improve yourself

Then with this add an issue file

### 2. Build

Choose a random issue to work on, then do it

### 3. Verify

Verify the app didn't crash since the last updates

## SELF.md

A document telling the bot about itself

## Web Server

A basic express server to host the APIs needed to make the web portion work. This will also house the core chat loop.

- Express
- Prisma
- Sqlite

## Web UI

A basic web UI with tanstack router to show whatever the AI wants

- Vite
- React
- Tanstack Router

## Agent?

This is an open question; do we build our own coding agent or use an existing one like opencode

## Skills & Requirements

List of skills we'll need to write:

- Issue management
- Requirements management
- SELF management