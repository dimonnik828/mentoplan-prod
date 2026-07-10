import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');

const pdfPath = path.join(__dirname, '../uploads/ttk.pdf');
const dataBuffer = fs.readFileSync(pdfPath);

pdfParse(dataBuffer).then(data => {
  const fullText = data.text;
  const numberRegex = /(?:No|№)\s*(\d+)/gi;
  let match;
  const positions: { number: string; index: number }[] = [];
  while ((match = numberRegex.exec(fullText)) !== null) {
    positions.push({ number: match[1], index: match.index });
  }

  const target = '02293';
  const targetPositions = positions.filter(p => p.number === target);
  console.log(`🔍 Найдено позиций для номера ${target}: ${targetPositions.length}`);

  // Находим самый длинный блок
  let bestBlock = '';
  let bestLength = 0;
  for (const pos of targetPositions) {
    const next = positions.find(p => p.index > pos.index);
    const end = next ? next.index : fullText.length;
    const block = fullText.substring(pos.index, end);
    if (block.length > bestLength) {
      bestLength = block.length;
      bestBlock = block;
    }
  }

  console.log(`📄 Самый длинный блок для ${target} (длина ${bestBlock.length} символов):`);
  console.log('--- Все строки блока (с номерами строк) ---');
  const lines = bestBlock.split('\n').map((l, i) => ({ index: i, text: l.trim() })).filter(l => l.text.length > 0);
  lines.forEach(l => console.log(`${l.index}: ${l.text}`));
  console.log('----------------------------------------');

  console.log('🔍 Строки, содержащие числа с запятыми (потенциальные ингредиенты):');
  const candidates = lines.filter(l => /,/.test(l.text));
  candidates.forEach(l => console.log(`${l.index}: ${l.text}`));
});