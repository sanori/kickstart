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
  const lastT = Array(n).fill(-1);
  const remembered = Array(g).fill(null).map(() => []);
  let unVisited = n;
  for (let t = m; t >= 0 && unVisited > 0; --t) {
    // console.error({t, unVisited, lastT, remembered});
    for(let i = 0; i < g; i++) {
      const [h, d] = guests[i];
      const cur = (h + (d * (t % n)) + n) % n;
      // console.error({t, i, cur, h, d});
      if (lastT[cur] <= t) {
        if (lastT[cur] !== t) {
          unVisited--;
          lastT[cur] = t;
        }
        remembered[i].push(cur);
      }
    }
  }
  // console.error({lastT, remembered});
  return remembered.map(x => x.length);
}

async function main() {
  const t = Number(await getLine());
  for (let i = 0; i < t; i++) {
    const [n, g, m] = (await getLine()).split(' ').map(Number);
    const guests = [];
    for (let i = 0; i < g; i++) {
      const [h, dir] = (await getLine()).split(' ');
      guests.push([Number(h)-1, (dir === 'C') ? 1 : -1]);
    }
    const res = solve(n, m, guests);
    console.log(`Case #${i+1}:`, res.join(' '));
  }
}

if (require.main === module) {
  main();
}