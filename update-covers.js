#!/usr/bin/env node
// 为 novels.json 添加 coverUrl（源站封面链接）
var fs = require('fs');

// 仅包含已验证的书号
var KNOWN_IDS = {
  '斗破苍穹': '1887',
  '盘龙': '96980',
  '遮天': '96508',
  '庆余年': '114496',
  '凡人修仙传': '1010734492',
  '全职高手': '121151',
  '大主宰': '340376',
  '完美世界': '3676443',
  '修罗武神': '2303060',
  '我欲封天': '3680390',
  '武动乾坤': '2295554',
  '剑来': '1014708160',
  '牧神记': '1010866284',
  '诡秘之主': '1010868264',
  '大道朝天': '1015533780',
  '一念永恒': '1004604608',
  '求魔': '2070910',
  '莽荒纪': '2502372',
  '仙逆': '1264634',
  '吞噬星空': '1639199',
};

var novels = JSON.parse(fs.readFileSync('novels.json', 'utf8'));
var count = 0;

novels.forEach(function(n) {
  var qidianId = KNOWN_IDS[n.title.zh];
  if (qidianId) {
    n.coverUrl = 'https://qidian.qpic.cn/qdbimg/349573/' + qidianId + '/180';
    count++;
  } else {
    n.coverUrl = '';
  }
});

fs.writeFileSync('novels.json', JSON.stringify(novels, null, 2), 'utf8');
console.log('更新完成: ' + novels.length + ' 部小说');
console.log('  有封面URL: ' + count + ' 部（使用 Qidian CDN）');
console.log('  SVG回退: ' + (novels.length - count) + ' 部');
