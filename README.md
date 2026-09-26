# TickTick CLI Skill for Coding Agents

A battle-tested agent skill for operating [TickTick](https://ticktick.com) from the terminal via the `@ticktick/ticktick-cli` npm package. Built for CLI coding agents (ZCode, Claude Code, Codex, …): drop it into your skills folder and the agent can create reminders, list tasks, and complete/delete them — with Persian (Jalali) calendar support and timezone-safe recipes that were all verified in practice.

## What's inside

| File | Purpose |
|---|---|
| `SKILL.md` | The skill itself: trigger-word mapping, speed rules, hard-won gotchas, copy-paste recipes |
| `week-list.mjs` | One-command task list — overdue + current week (or N days) + later, Jalali dates, `projectId/taskId` ready for `task complete` |

## Install

Requires Node 18+ and a one-time login. Copy the two files into your agent's skills directory (path varies by agent — e.g. `~/.agents/skills/ticktick/`):

```bash
git clone https://github.com/najafibehzad/ticktick-skill
cp -r ticktick-skill/ ~/.agents/skills/ticktick/
npm install -g @ticktick/ticktick-cli
ticktick auth login   # OAuth in browser, token persisted
```

## Sample of the gotchas (why this skill exists)

- `project list` **always returns empty** (API limitation) → use `task filter --json`
- `--project <id>` is **mandatory** on `task create`
- Timed tasks must embed the local UTC offset (`date -d "tomorrow 09:00 +0330"`) — a raw `Z` shifts the hour (Iran has no DST, always +03:30)
- Jalali dates: never guess the conversion — one-command recipe included
- Exact-time reminder = `--reminders "TRIGGER:PT0S"`; all-day = `"TRIGGER:P0D"`
- Reminder requests from the user («یادم بنداز») always mean TickTick — not local notes, not cron
- No date given → ask date/time/priority in a **single** question box, then create without further round-trips

Tested with `@ticktick/ticktick-cli` v0.1.14 on Windows (Git Bash), Node 20+, September 2026.

## نسخهٔ فارسی

اسکیل آماده برای ایجنت‌های کدنویس (ZCode / Claude Code / …) تا از ترمینال با تیک‌تیک کار کنند: ساخت یادآور (حتی با تاریخ شمسی)، لیست کارهای هفته با یک دستور، بستن و حذف تسک. نصب: دو فایل را در پوشهٔ اسکیل‌های ایجنت خود بگذارید (مثلاً `~/.agents/skills/ticktick/`)، سپس `npm i -g @ticktick/ticktick-cli` و `ticktick auth login`.
