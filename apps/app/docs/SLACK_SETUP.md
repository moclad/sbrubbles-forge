# Slack Expense Tracking — Setup Guide

Post a message (or use `/expense`) in a Slack channel to automatically log an expense against your currently active trip.

---

## How it works

| Trigger | Example | Response |
|---|---|---|
| Slash command | `/expense 25 lunch at the sushi place` | Ephemeral reply visible only to you |
| Channel message | `35 taxi to the airport` | Bot posts a confirmation in the channel |

The message is parsed by GPT-4o-mini, which extracts the amount, description, category, and optional location. The expense is inserted into the trip whose date range includes today.

---

## Prerequisites

- A deployed (or ngrok-exposed) instance of `apps/api` reachable over HTTPS
- An OpenAI API key (`OPENAI_API_KEY`)

---

## Step 1 — Create a Slack app

1. Go to **[api.slack.com/apps](https://api.slack.com/apps)** → **Create New App** → **From scratch**
2. Enter a name (e.g. `Trip Tracker`) and select your workspace
3. Click **Create App**

---

## Step 2 — Copy `SLACK_SIGNING_SECRET`

1. In the left sidebar → **Basic Information**
2. Under **App Credentials** → copy **Signing Secret**

```env
SLACK_SIGNING_SECRET=<paste here>
```

---

## Step 3 — Add bot scopes and install

1. Left sidebar → **OAuth & Permissions**
2. Scroll to **Scopes → Bot Token Scopes** → **Add an OAuth Scope** → add both:
   - `chat:write`
   - `channels:history`
3. Scroll back to the top → **Install App to Workspace** → **Allow**
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

```env
SLACK_BOT_TOKEN=xoxb-<paste here>
```

---

## Step 4 — Create the `/expense` slash command

1. Left sidebar → **Slash Commands** → **Create New Command**
2. Fill in:
   | Field | Value |
   |---|---|
   | Command | `/expense` |
   | Request URL | `https://<your-api-domain>/api/slack` |
   | Short Description | Log a trip expense |
   | Usage Hint | `<amount> <description>` |
3. Click **Save**

---

## Step 5 — Enable Event Subscriptions

1. Left sidebar → **Event Subscriptions** → toggle **Enable Events** on
2. Set **Request URL** to `https://<your-api-domain>/api/slack`
   - Slack sends a one-time `url_verification` challenge — the route handles this automatically
   - Wait for the **Verified** checkmark before continuing
3. Under **Subscribe to bot events** → **Add Bot User Event** → select `message.channels`
4. Click **Save Changes**
5. If prompted to reinstall the app, click **Reinstall App** and re-copy the bot token

---

## Step 6 — Get `SLACK_CHANNEL_ID` and invite the bot

1. In Slack, open the channel where expenses will be posted
2. Click the **channel name** at the top → scroll to the bottom of the modal → copy the **Channel ID** (e.g. `C08XXXXXXXX`)
3. In the channel, type `/invite @Trip Tracker` to give the bot access

```env
SLACK_CHANNEL_ID=C08XXXXXXXX
```

---

## Step 7 — Configure environment variables

Add the following to `apps/api/.env.local` (or your deployment environment):

```env
SLACK_SIGNING_SECRET=your_signing_secret
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_CHANNEL_ID=C08XXXXXXXX
OPENAI_API_KEY=sk-your-openai-key
```

---

## Local development with ngrok

The Slack platform requires a publicly reachable HTTPS URL. During local development, use [ngrok](https://ngrok.com):

```bash
ngrok http 3005
```

Use the generated `https://*.ngrok-free.app` URL as your Request URL in Steps 4 and 5. Note that the URL changes on every ngrok restart — update it in the Slack app settings each time.

---

## Testing

### Slash command
In any Slack channel where the bot is installed:
```
/expense 25 lunch at the ramen place
```
You should receive an ephemeral reply:
```
✅ Logged $25.00 — Lunch at the ramen place (Food) on trip "Tokyo Trip"
```

### Channel message
Post a plain message in the monitored channel:
```
12.50 coffee at the airport
```
The bot will reply in the same channel:
```
✅ Logged $12.50 — Coffee at the airport (Food) on trip "Tokyo Trip"
```

### Error cases
- **No active trip**: returned if no trip's `startDate ≤ today ≤ endDate`
- **Unparseable message**: returned if the AI cannot extract an amount from the text
