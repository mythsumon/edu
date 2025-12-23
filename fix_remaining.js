const fs = require('fs');

// Read the file line by line
let lines = fs.readFileSync('app/admin/operations/page.tsx', 'utf8').split('\n');

// Fix each line
lines = lines.map((line) => {
  // Fix line 156: 진행? { -> '진행?': {
  if (line.trim().startsWith('진행') && line.includes('{ bg:')) {
    line = line.replace(/^(\s*)진행([^']*)\? \{/, "$1'진행$2?': {");
  }
  // Fix line 157: ?료: { -> '?료': {
  if (line.trim().startsWith('?') && line.includes(': { bg:')) {
    line = line.replace(/^(\s*)\?([^']*): \{/, "$1'?$2': {");
  }
  return line;
});

// Write back
fs.writeFileSync('app/admin/operations/page.tsx', lines.join('\n'), 'utf8');
console.log('Fixed remaining statusStyle keys');




