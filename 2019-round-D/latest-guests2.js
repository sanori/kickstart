#!/usr/bin/env node
'use strict';

const { createInterface } = require('readline');
const rl = createInterface({
  input: process.stdin,
  crlfDelay: Infinity
});

const buf = [];
const prom = [];
let maxBuf = 0;
let maxProm = 0;
rl.on('line', (line) => {
  if (prom.length > 0) {
    maxProm = Math.max(maxProm, prom.length);
    const [resolve, reject] = prom.shift();
    resolve(line);
  } else {
    rl.pause();
    buf.push(line);
    maxBuf = Math.max(maxBuf, buf.length);
  }
});

rl.on('close', () => {
  // console.error({maxProm, maxBuf});
});

async function getLine() {
  return new Promise((resolve, reject) => {
    if (buf.length > 0) {
      const line = buf.shift();
      resolve(line);
    } else {
      prom.push([resolve, reject]);
      rl.resume();
    }
  });
}

function solve(n, m, guests) {
  const g = guests.length;;
  const guest2group = [];
  const mm = m % n;
  const groups = {};
  groups[1] = new Set();
  groups[-1] = new Set();
  for (let i = 0; i < g; i++) {
    const [h, dir] = guests[i];
    const dest = (h + (dir * mm) + n) % n;
    groups[dir].add(dest);
    guest2group[i] = [dir, dest];
  }
  // console.log({guest2group, groups});
  const lastVisit = Array(n);
  const remGroup = {};
  remGroup[-1] = {};
  remGroup[1] = {};
  for (const dir of [1, -1]) {
    const list = Array.from(groups[dir]);
    if (list.length < 1) continue;
    list.sort((a, b) => (b - a) * dir);
    list.push(list[0] - n * dir);
    for (let i = 0; i < list.length - 1; i++) {
      const diff = Math.min((list[i] - list[i+1]) * dir, m + 1);
      const dest = list[i];
      for (let j = 0; j < diff; j++) {
        const t = m - j;
        const cur = (dest - j * dir + n) % n;
        const last = lastVisit[cur];
        if (last === undefined) {
          lastVisit[cur] = {t, group: [dir, dest]};
          remGroup[dir][dest] = remGroup[dir][dest] + 1 || 1;
        } else if (last.t <= t) {
          if (last.t !== t) {
            const [dir, dest] = last.group;
            remGroup[dir][dest]--;
          }
          remGroup[dir][dest] = remGroup[dir][dest] + 1 || 1;
        }
      }
    }
  }
  const res = [];
  for (let i = 0; i < g; i++) {
    const [dir, dest] = guest2group[i];
    res[i] = remGroup[dir][dest];
  }
  return res;
}

async function main() {
  const t = Number(await getLine());
  for (let i = 0; i < t; i++) {
    const [n, g, m] = (await getLine()).split(' ').map(Number);
    const guests = [];
    for (let i = 0; i < g; i++) {
      const [h, dir] = (await getLine()).split(' ');
      guests.push([Number(h) - 1, (dir === 'C') ? 1 : -1]);
    }
    const res = solve(n, m, guests);
    console.log(`Case #${i + 1}:`, res.join(' '));
  }
}

if (require.main === module) {
  main();
}