import fs from 'fs';
import path from 'path';

const appDir = './app';

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      replaceInDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;
      if (content.includes("redirect('/sign-in')")) {
        console.log(`Updating (single quotes): ${filePath}`);
        content = content.replaceAll("redirect('/sign-in')", "redirect('/')");
        changed = true;
      }
      if (content.includes('redirect("/sign-in")')) {
        console.log(`Updating (double quotes): ${filePath}`);
        content = content.replaceAll('redirect("/sign-in")', "redirect('/')");
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

replaceInDir(appDir);
console.log('Redirect script execution complete.');
