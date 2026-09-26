#!/usr/bin/env node
// week-list.mjs — لیست تسک‌های تیک‌تیک در یک دستور: عقب‌افتاده + این هفته (یا N روز پیش‌رو) + آینده
// اجرا: node week-list.mjs [days]   (days = تعداد روز از امروز؛ پیش‌فرض: تا جمعهٔ همین هفته)
import { execSync } from "node:child_process";

const OFFSET_MIN = 210; // تهران +03:30 — ایران DST ندارد
const WD_FA = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];
const MO_FA = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const PR = { 0: "", 1: " (کم)", 3: " (متوسط)", 5: " (زیاد)" };

function g2j(gy, gm, gd) {
  const gdm = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const div = (a, b) => ~~(a / b);
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd + gdm[gm - 1];
  jy += 33 * div(days, 12053); days %= 12053;
  jy += 4 * div(days, 1461); days %= 1461;
  if (days > 365) { jy += div(days - 1, 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

const tehran = iso => new Date(new Date(iso).getTime() + OFFSET_MIN * 60000);
const ymd = d => d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
const jalali = iso => {
  const d = tehran(iso);
  const [, jm, jd] = g2j(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  return `${WD_FA[d.getUTCDay()]} ${jd} ${MO_FA[jm - 1]}`;
};
const clock = t => {
  if (t.isAllDay) return "کل‌روز";
  const d = tehran(t.dueDate);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
};
const line = t => `${jalali(t.dueDate)} ${clock(t)} | ${t.title}${PR[t.priority ?? 0]} | ${t.projectId}/${t.id}`;

const argDays = process.argv[2] ? parseInt(process.argv[2], 10) : null;
const raw = execSync("ticktick task filter --json", { encoding: "utf8", shell: true }).replace(/^\uFEFF/, "");
const all = JSON.parse(raw);
const open = all
  .filter(t => (t.status ?? 0) === 0 && t.dueDate)
  .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1));

const nowT = tehran(new Date().toISOString());
const today = ymd(nowT);
const start = new Date(nowT); start.setUTCDate(start.getUTCDate() - ((nowT.getUTCDay() + 1) % 7)); // شنبهٔ همین هفته
const end = argDays
  ? new Date(nowT.getTime() + (argDays - 1) * 86400000)
  : (() => { const e = new Date(start); e.setUTCDate(e.getUTCDate() + 6); return e; })(); // جمعه

const k = t => ymd(tehran(t.dueDate));
const late = open.filter(t => k(t) < today);
const win = open.filter(t => k(t) >= today && k(t) <= ymd(end));
const later = open.filter(t => k(t) > ymd(end));
const nodue = all.filter(t => (t.status ?? 0) === 0 && !t.dueDate).length;

console.log(`== عقب‌افتاده (${late.length}) ==`);
late.forEach(t => console.log(line(t)));
console.log(`== ${argDays ? `${argDays} روز پیش‌رو` : "این هفته تا جمعه"} (${win.length}) ==`);
win.forEach(t => console.log(line(t)));
if (later.length) { console.log(`== بعد از بازه (${later.length}) ==`); later.forEach(t => console.log(line(t))); }
if (nodue) console.log(`== بدون تاریخ (${nodue}) ==`);
