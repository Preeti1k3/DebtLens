import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (p.endsWith('.tsx')) {
      const before = fs.readFileSync(p, 'utf8');
      const after = before.replaceAll('href="/" className="text-sm', 'href="/dashboard" className="text-sm');
      if (after !== before) { fs.writeFileSync(p, after); console.log('updated', p); }
    }
  }
}
walk('app');