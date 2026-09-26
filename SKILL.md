---
name: ticktick
description: Fast, accurate TickTick operations via the installed ticktick CLI — create reminders/tasks (incl. Persian Jalali dates) in minimal steps, list/filter/complete tasks, habits, focus. Use when the user mentions تیک‌تیک/TickTick, or says «یادم بنداز», «یادآور بساز», «یادآور بذار», «به تیک‌تیک اضافه کن», «تسک‌های امروز», birthday/تولد reminders, or asks to query/complete/delete their TickTick tasks.
---

# Skill: ticktick — اجرای سریع و دقیق کارها در تیک‌تیک

## 🔥 نگاشت کلمات کاربر (مهم‌ترین قاعده)

- **«یادم بنداز» / «یادآور بساز» / «یادآور بذار» / «یادم باشه»** → یعنی **ثبت در تیک‌تیک** (`task create`). نه یادداشت محلی، نه کرون، نه چیزی دیگر — همیشه تیک‌تیک.
- **تاریخ داده شد** → صفر سؤال، مستقیم بساز (پیش‌فرض‌ها: تاریخ بدون ساعت = هم‌روزه + یادآور P0D؛ تولد/سالگرد = تکرار سالانه) و در تأیید یک‌خطی بگو چه گذاشتی.
- **تاریخ اصلاً نداد** → ⛔ نساز؛ **همهٔ سؤال‌ها در یک باکس واحد** (AskUserQuestion، ۳ سؤال در یک فراخوان، نه پشت هم):
  1. **تاریخ** — امروز / فردا / آخر هفته / هفته بعد (+ Other = ورود آزاد، حتی شمسی مثل «۲۶ مهر»)
  2. **ساعت** — هم‌روزه (کل روز) / ۹ صبح / ۱۲ ظهر / ۲۱ شب (+ Other = ساعت آزاد)
  3. **اولویت** — هیچ / کم / متوسط / زیاد
  - گزینهٔ محتمل‌تر اول + در تأیید نهایی یک خط بگو چه ساختی. اگر عنوان هم نداد، همان سؤال چهارمی را به همان باکس اضافه کن — هرگز باکس جداگانه.

## ⚡ قواعد سرعت (هدف: هر یادآور = حداکثر یک دستور)

- **هرگز اول `auth status` اجرا نکن** — مستقیم create بزن؛ فقط اگر خطای auth داد → `ticktick auth login`.
- «امروز/فردا/پس‌فردا» → با `date -d` حل کن، پایتون ممنوع. تاریخ شمسی → **تبدیل و ساخت در یک دستور ترکیبی** (رسپی پایین). رقم‌های فارسی را خودت موقع نوشتن دستور به لاتین تبدیل کن.
- **هیچ fetch جدا برای تأیید نزن** — خود JSON پاسخِ create = تأیید نهایی؛ فقط چشمت روی `dueDate` و `priority` باشد.
- جواب چت: ۲-۳ خط + باکس «چکار کنی». گزارش فرایند ممنوع.
- **درخواست لیست («کارهای من/این هفته/امروز/تسک‌هام») → فقط `week-list.mjs`** — یک دستور، خروجی نهایی؛ پایتون/گرهِ فیلتر دستی ننویس.
- وقتی تاریخ هست، باکس سؤال باز نکن — قاعدهٔ باکس فقط برای «تاریخ کلاً داده نشده» است.

## 🔥 گاتچاهای حیاتی

1. **`--project` اجباری است** روی create. Inbox کاربر = `inbox118995266`. شناسهٔ پروژه‌های دیگر فقط از `projectId` در خروجی `task filter --json`.
2. **`project list` همیشه خالی برمی‌گردد** (محدودیت API) — اعتماد نکن؛ به‌جایش `task filter --json`.
3. **دستور `task list` وجود ندارد** — لیست = اسکریپت `week-list.mjs` (رسپی پایین) یا `task filter --json` / `task search "کلیدواژه"`.
4. **تاریخ شمسی را حدس نزن** — persiantools (نصب است --user). مثال تأییدشده: ۲۶ مهر ۱۴۰۵ = 2026-10-18 (یکشنبه). 1405 کبیسه نیست.
5. **تسک ساعت‌دار: آفست تهران را داخل تاریخ بده یا با `date -d` به UTC ببر** — `Z` خام ساعت را جابجا می‌کند (Z=UTC). ایران DST ندارد، همیشه +۳:۳۰. تست‌شده: ۹ صبح تهران = 05:30Z. تأیید: `dueDate` در JSON = ساعت تهران منهای ۳:۳۰.
6. **`complete` دو پارامتر می‌خواهد**: `ticktick task complete <projectId> <taskId>` — اول از filter/search بگیر.
7. یادآور سرِ ساعت دقیق (تسک زمان‌دار) = `--reminders "TRIGGER:PT0S"`؛ هم‌روزه = `"TRIGGER:P0D"`.
8. اولویت: `--priority 0=هیچ 1=کم 3=متوسط 5=زیاد`.
9. **جابجایی تسک بین پروژه‌ها خراب است** — `task update <id> --id <id> --project <other>` در v0.1.14 خطای «Cannot read properties of undefined (reading 'title')» می‌دهد (تست‌شده، همهٔ تسک‌ها). پس تسک را **از همان اول در پروژهٔ درست بساز**؛ جابجایی فقط از اپ موبایل.
10. `project create` و `tag create` کار می‌کنند (برخلاف `project list` که همیشه خالی است) — تأیید ساخت = خودِ JSON پاسخ؛ برای تگ فارسی `--name` و `--label` را یکسان بده.

## 🗂 ساختار دائمی کاربر (۲۰۲۶-۰۹-۲۶ ساخته شد — تسک را همیشه در پروژهٔ درست بساز)

| پروژه | ID | کاربرد |
|---|---|---|
| Inbox | `inbox118995266` | فقط ورودیِ دم‌دست؛ در مرور جمعه تخلیه شود |
| مناقصات ستاد | `6ab80cbb8f086a6e16999664` | آگهی‌ها، مهلت‌ها، پیگیری اسناد |
| پیمان‌ها و قراردادها | `6ab80cbc8f08f1c96f4e053e` | کارفرما/پیمانکار، صورت وضعیت، نامه‌ها |
| اداری و مالی | `6ab80cbe8f08d994cf727cd2` | بیمه، مالیات، کاتب، ثبت‌نام‌ها |
| شخصی و خانواده | `6ab80cc08f08717709490583` | تولدها، خانه، شخصی |

تگ‌های آماده: `کرج` `فردیس` `قدس` `نظرآباد` (شهر) · `مهلت` `تماس` `پیگیری` (نوع). تگ جدید = `ticktick tag create --name "X" --label "X" --json`.

## ⚡ رسپی‌های یک‌خطی (کپی-پیست)

**هم‌روزه با تاریخ آماده:**
```bash
ticktick task create --title "عنوان" --project inbox118995266 --all-day --due-date "2026-10-18T00:00:00Z" --time-zone "Asia/Tehran" --reminders "TRIGGER:P0D" --json
```

**ساعت‌دار — امروز/فردا با ساعت تهران، تبدیل UTC خودکار:**
```bash
D=$(date -d "tomorrow 09:00 +0330" -u +%FT%TZ); ticktick task create --title "عنوان" --project inbox118995266 --due-date "$D" --time-zone "Asia/Tehran" --priority 5 --reminders "TRIGGER:PT0S" --json
```

**شمسی — تبدیل و ساخت در همان یک دستور (رقم‌ها لاتین، شمسی=YYYY-MM-DD):**
```bash
D=$(python -c "from persiantools.jdatetime import JalaliDate; print(JalaliDate.fromisoformat('1405-07-26').to_gregorian().isoformat())"); ticktick task create --title "عنوان" --project inbox118995266 --all-day --due-date "${D}T00:00:00Z" --time-zone "Asia/Tehran" --reminders "TRIGGER:P0D" --json
```

**تکرار سالانه (تولد):** رسپی هم‌روزه + `--repeat "RRULE:FREQ=YEARLY;INTERVAL=1" --repeat-from 0`
(تست‌شده: «تولد» id=6ab7f9e78f08f1c96f4a98cf، ۲۶ مهر، سالانه. و «ثبت نام دارایی» id=6ab7fce68f08717709478c49، فردا ۹صبح، اولویت ۵.)

**لیست کارها (عقب‌افتاده + این هفته/بازه + آینده) — همیشه اول این را بزن، یک‌لاینر دستی ممنوع:**
```bash
node ~/.agents/skills/ticktick/week-list.mjs      # این هفته (شنبه تا جمعه) + عقب‌افتاده‌ها
node ~/.agents/skills/ticktick/week-list.mjs 14   # ۱۴ روز پیش‌رو
```
خروجی: تاریخ شمسی + ساعت تهران + اولویت + `projectId/taskId` آماده برای `task complete`. جواب چت = جدول ۳ستونه (روز/ساعت/کار) + بخش عقب‌افتاده اگر بود.

**بستن/حذف:** `filter --json` → projectId+taskId → `task complete`/`task delete`.

## دستورهای اصلی (مرجع)

```
task filter --json        # همه؛ فیلتر: --status 0=open,2=completed --priority --tag --start-date --end-date
task search "کلمه" --json # جستجو؛ --status --due-from --due-to
task create / update <taskId> / complete <projectId> <taskId> / delete <projectId> <taskId> / completed --json
project create --name --color --json | project get/update/delete <id> | project data <id>   # ساخت پروژه کار می‌کند؛ project list همیشه خالی
tag create --name --label --json | tag list / rename / delete                               # تگ فارسی: name=label
habit list | focus ... | countdown   # بقیهٔ امکانات
```

عنوان فارسی آزاد است (یونیکد در آرگومان مشکلی ندارد).
