# The Real Claude Bot: How to Replace Openclaw with Claude Channels

An Instagram creator just went viral showing how he uninstalled OpenClaw on his Mac Mini and replaced it with Claude Code and a feature called Channels.

Here's the whole thing, step by step, including the one detail the reel didn't cover that will save you hours of debugging.

1. What Claude Code Channels actually does and why it replaces @openclaw 

1. How to sync your files between two computers for $0/month using SyncThing (free github)

1. The exact folders you need to sync and the ones that will break everything if you do

1. The one Channels limitation nobody mentioned (and why a Mac Mini solves it)

1. How to make Claude auto-restart if it crashes using a LaunchAgent (so it truly runs 24/7)

1. The complete setup from zero to "text Claude from your phone"

Real quick  ...

> If you're non-technical and want to learn how to build systems like this, join our Build With AI community: http://return-my-time.kit.com/1bd2720397

Alright lets get into it... 

 

## Why This Setup Exists

Claude Code just launched a feature called Channels. In plain English: you can text Claude from your phone using Telegram, Discord, or iMessage. Claude receives the message, does the work on your computer using your real files, and sends the answer back to your phone.

That's exactly what @openclaw  did. But Channels is built into Claude Code. No extra software, no third-party platform to maintain.

The creator in the viral reel figured this out. He installed Claude Code on a Mac Mini (a small desktop computer that stays on all the time), connected it to Telegram, and now he texts Claude tasks from anywhere. Claude runs them on the Mini and replies in Telegram.

But here's the part that trips people up.

## The Two-Machine Problem

If you build skills and configure tools on your laptop, but Claude runs on your Mac Mini, the Mini doesn't have any of that work. It's a blank slate.

You need both machines to have the same files. That's where SyncThing comes in.

SyncThing is a free, well-established program (it's been around since 2013 and is trusted by tens of thousands of developers) that syncs folders between your computers. No cloud storage. No monthly fee. Your files go directly from one machine to the other over your home network.

Think of it like having two copies of the same desk. Whatever you put on one desk appears on the other within seconds. You build on your laptop. The Mac Mini automatically gets everything you built.

## What to Sync (and What Will Break If You Do)

This is where most people mess up. You can't sync everything. Some files are specific to each machine and will cause problems if you copy them over.

Sync these folders:

→ Your skills folder (located at ~/.claude/skills/ — the ~ symbol just means "your home folder") - so both machines have the same capabilities 

→ Your commands folder (~/.claude/commands/) - so both machines respond to the same shortcuts 

→ Your settings file (~/.claude/settings.json) - so both machines behave the same way 

→ Your knowledge base (Obsidian vault, reference docs, whatever you use) - so Claude has the same context everywhere 

→ Your MCP tool configs (MCP stands for Model Context Protocol — these are connections that let Claude use external tools like Google Calendar, Slack, etc.) - so both machines can access the same tools

Do NOT sync these (add them to a file called .stignore - a configuration file that tells SyncThing which folders to skip):

→ settings.local.json - this stores overrides specific to each machine 

→ history.jsonl - conversation logs that are unique to each machine 

→ The projects/ folder - Claude tracks projects by exact file path, and your machines have different paths 

→ node_modules, .git, .env - these are behind-the-scenes development files. They're bulky, machine-specific, or contain private keys. Syncing them causes more problems than it solves.

The path trick nobody mentions: Claude Code tracks your projects by the exact folder path on your computer. If your laptop uses /Users/nick/Projects/ but your Mini uses /Users/admin/Projects/, Claude gets confused about which project is which. The fix: use the same username on both machines so the folder paths match.

I'm curious how others handle the path issue - if you've found a cleaner workaround, I'd love to hear it.

## The One Limitation That Makes the Hardware Worth It

Here's the detail the viral reel skipped.

Claude Code Channels has no message queue (there's no "inbox" that holds messages until Claude is ready). If Claude's session isn't running when you send a Telegram message, that message is gone. Not saved for later. Not waiting in line. Just lost.

On a laptop, this happens every time you close the lid. Every message you send while your laptop sleeps just disappears.

That's the entire reason the Mac Mini matters. Not because it's faster. Not because it runs better AI. Because it never sleeps. Your Claude Code session stays open 24/7. Every message from your phone hits a live session. Every task gets processed.

If you already bought a Mac Mini for OpenClaw, you're repurposing hardware you already own. No new investment. Just a different (and free) software stack running on the same machine.

## The 15-Minute Setup (Copy-Paste Ready)

Step 1: Set up SyncThing on the Mac Mini (5 minutes)

Open Terminal (the black-and-white command line app — search for "Terminal" in Spotlight or find it in Applications → Utilities) and type these two commands:

→ brew install syncthing — this uses Homebrew, a free tool that installs programs from the command line. If you don't have Homebrew, install it first at https://brew.sh (one-line copy-paste install) 

→ brew services start syncthing (makes it start automatically whenever the Mini turns on) 

→ Open your browser to localhost:8384 — this is a web address that only works on your own computer (it opens the SyncThing dashboard where you manage everything) 

→ Go to System Settings, then Energy, and set the Mac Mini to never sleep

Step 2: Set up SyncThing on your laptop (5 minutes)

→ Same two commands: brew install syncthing then brew services start syncthing→ Open localhost:8384 on your laptop → Add your Mac Mini as a connected device (each machine shows a "Device ID" you share with the other) → Select which folders to sync between them (use the list from the section above)

Step 3: Set up Claude Code Channels with Telegram (5 minutes)

Before you start: make sure Bun is installed. Bun is a small program that Claude Code needs to run plugins (add-on features like Telegram). Type bun --version in Terminal. If you see a version number, you're good. If you get an error, install it by pasting this into Terminal: curl -fsSL https://bun.sh/install | bash (this downloads and runs the Bun installer automatically)

→ Open Telegram on your phone, find @BotFather, and send /newbot. Give it a name. Copy the token it gives you (this is your bot's unique password - you'll need it in the next step). 

→ On the Mac Mini, open Claude Code and type: /plugin install telegram@claude-plugins-official

→ Then type: /reload-plugins→ Configure your bot: /telegram:configure <paste-your-token-here>

→ Quit Claude Code and restart it with: claude --channels plugin:telegram@claude-plugins-official

→ Go back to Telegram on your phone and send any message to your new bot. It'll reply with a pairing code. 

→ Back in Claude Code, type: /telegram:access pair <the-code-from-telegram>

→ Lock it down so only you can send messages: /telegram:access policy allowlist

That handles the basic setup. But what happens when Claude crashes at 3am?

## Making It Bulletproof with a LaunchAgent

Right now, if Claude Code crashes or your Mac Mini reboots after a power outage, your Telegram bot goes silent. You won't know until you text Claude and get no response.

A LaunchAgent fixes this. It's a built-in macOS feature (no extra software to install) that watches a program and automatically restarts it if it stops. Think of it like a babysitter for Claude Code - if Claude falls asleep, the babysitter wakes it back up.

Here's the setup:

Step 4a: Create the restart script

Open Terminal on the Mac Mini and create a small script file (a script is just a text file that runs commands automatically):

→ mkdir -p ~/.claude/scripts — creates a new folder to store the script (mkdir = "make directory," -p means "create parent folders if needed") → nano ~/.claude/scripts/claude-channels-restart.sh — opens a simple text editor called nano right inside Terminal

Paste this into the file:

 

Save and close (press Ctrl+X, then Y to confirm, then Enter). Then make the script runnable:

→ chmod +x ~/.claude/scripts/claude-channels-restart.sh — this tells your Mac "it's okay to run this file as a program" (by default, new files can't be executed)

What this script does in plain English: It opens a background terminal window (called tmux), launches Claude Code with Telegram connected, waits for everything to boot up, then tells Claude to start listening for messages. If Claude was already running, it cleanly shuts down the old session first.

Step 4b: Create the LaunchAgent

This tells macOS to run that script automatically. A .plist file is just a settings file that macOS reads — think of it as a set of instructions you're handing to your Mac. Create it:

→ nano ~/Library/LaunchAgents/com.claude.channels.plist

Paste this:

 

Save and close (Ctrl+X, Y, Enter — same as before). Then activate it:

→ launchctl load ~/Library/LaunchAgents/com.claude.channels.plist — launchctl is the built-in Mac command that turns LaunchAgents on and off. "load" means "start watching and running this."

What this does in plain English: Two things. First, RunAtLoad means Claude starts automatically whenever you log into the Mac Mini (including after a reboot or power outage). Second, StartCalendarInterval restarts Claude fresh every day at 4am, which prevents the session from getting stale after running for days.

Why LaunchAgent and not a cron job: Cron (an older scheduling tool) runs in a stripped-down environment that can't access your login credentials. Claude Code needs your authentication to work, and LaunchAgents run inside your user session where those credentials are available. This is the one detail that will save you hours of debugging if you try the cron approach first.

Step 4c: Verify it works

→ launchctl list | grep claude - this searches your running LaunchAgents for anything with "claude" in the name. If you see a line with "com.claude.channels," it's working. → Open Telegram and text your bot. You should get a response. → To test crash recovery: tmux kill-session -t claude-channels (this simulates Claude crashing) then wait for the next scheduled restart, or run the script manually with ~/.claude/scripts/claude-channels-restart.sh

Now your setup is truly hands-off. Claude Code starts on boot, restarts daily, and recovers from crashes automatically.

 

PS: If you like this starter pack, you'll love what's coming.

> I'm building a community where I break down exactly how to turn custom agents into a real employee: custom skills, scheduled workflows, and systems that run while you sleep.

> Join the waitlist here:https://return-my-time.kit.com/1bd2720397
