const fs = require('fs');
const obfuscator = require('javascript-obfuscator');

const input = fs.readFileSync('./src/main.js', 'utf8');
const obfuscatedCode = obfuscator.obfuscate(input, {
  compact: true,
  controlFlowFlattening: true,
  controlFlowFlatteningThreshold: 0.75,
  deadCodeInjection: true,
  deadCodeInjectionThreshold: 0.4,
  stringArray: true,
  rotateStringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
}).getObfuscatedCode();

fs.writeFileSync('./dist/main.ob.js', obfuscatedCode);
console.log('✅ 主脚本已混淆构建完成：dist/main.ob.js');
