# link-to-video

A Telegram userbot that automatically downloads YouTube Shorts when a link is sent.

## How it works

The script connects to Telegram using your account via the MTProto protocol (like a regular client) and listens for messages in specified chats.

**Outgoing messages** — when you send a YouTube Shorts link (and nothing else), the script:
1. Downloads the video
2. Sends it to the same chat (preserving reply-to if the link was a reply)
3. Deletes the original message with the link

**Incoming messages** — when someone sends you a YouTube Shorts link, the script:
1. Downloads the video
2. Sends it as a reply to their message

## Installation

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

## Configuration (.env)

```env
# Get at https://my.telegram.org → API development tools
API_ID=12345678
API_HASH=abcdef1234567890abcdef1234567890

# Filled automatically after first login
SESSION=

# Path to ffmpeg binary (required for high quality video with audio)
# Linux: /usr/bin/ffmpeg  |  Windows: C:\ffmpeg\bin\ffmpeg.exe
# ffprobe is expected to be in the same directory
FFMPEG_PATH=/usr/bin/ffmpeg

# Chats for outgoing messages — comma-separated IDs (empty = all chats)
OUTGOING_CHAT_IDS=12345678,12345678

# Chats for incoming messages — comma-separated IDs (empty = none)
INCOMING_CHAT_IDS=12345678

# Enable outgoing message handling
HANDLE_OUTGOING=true

# Enable incoming message handling
HANDLE_INCOMING=true
```

## Get chat IDs

```bash
npm run list-chats
```

## Running

**First time** — login via terminal:
```bash
npm start
```
Enter your phone number and the code from Telegram. The session is saved to `.env` automatically.

**Background via pm2:**
```bash
npm install -g pm2
pm2 start index.js
pm2 save       # persist process list
pm2 startup    # auto-start on reboot
```

```bash
pm2 logs       # view logs
pm2 restart all
pm2 stop all
```

## Installing ffmpeg

**Ubuntu/Debian:**
```bash
sudo apt install ffmpeg
```

**Windows:**

Download from https://github.com/BtbN/FFmpeg-Builds/releases (`ffmpeg-master-latest-win64-gpl-shared.zip`), extract and set `FFMPEG_PATH` in `.env`.
