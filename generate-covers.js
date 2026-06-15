#!/usr/bin/env node
// 生成 SVG 封面图脚本
var fs = require('fs');

var novels = JSON.parse(fs.readFileSync('novels.json', 'utf8'));

// 各题材的配色方案
var PALETTES = {
  '玄幻': { bg1: '#1a1a2e', bg2: '#16213e', accent: '#e94560', glow: '#0f3460' },
  '仙侠': { bg1: '#0b2b26', bg2: '#163832', accent: '#64b5a0', glow: '#235347' },
  '都市': { bg1: '#2c3e50', bg2: '#3498db', accent: '#f1c40f', glow: '#2980b9' },
  '科幻': { bg1: '#0a0a2e', bg2: '#1a1a4e', accent: '#00d4ff', glow: '#4a00e0' },
  '言情': { bg1: '#4a1942', bg2: '#89375f', accent: '#f7c8d2', glow: '#ce7bb0' },
  '悬疑': { bg1: '#1a1a1a', bg2: '#2d2d2d', accent: '#cc4444', glow: '#4a4a4a' },
  '动作': { bg1: '#1e1e2f', bg2: '#2d2d44', accent: '#ff6b35', glow: '#c0392b' },
  '冒险': { bg1: '#0f3b3b', bg2: '#1a5a5a', accent: '#e8a87c', glow: '#3d7a7a' },
  '奇幻': { bg1: '#2d1b4e', bg2: '#1a0f2e', accent: '#a855f7', glow: '#6b21a8' },
  '游戏': { bg1: '#0f2b3d', bg2: '#1a3f5c', accent: '#4ade80', glow: '#1e6f3f' },
  '竞技': { bg1: '#1e1e2f', bg2: '#2a2a3f', accent: '#f59e0b', glow: '#b45309' },
  '历史': { bg1: '#2d1810', bg2: '#4a2818', accent: '#d4a574', glow: '#8b5e3c' },
  '权谋': { bg1: '#1f1333', bg2: '#2c1a4a', accent: '#c084fc', glow: '#7c3aed' },
  '恐怖': { bg1: '#0d0d0d', bg2: '#1a0505', accent: '#ef4444', glow: '#7f1d1d' },
};

// 为每部小说选择配色（基于第一个题材）
function getPalette(novel) {
  var genre = novel.genres[0];
  if (PALETTES[genre]) return PALETTES[genre];
  return { bg1: '#1a1a2e', bg2: '#16213e', accent: '#e94560', glow: '#0f3460' };
}

// 根据题材生成装饰图案的 SVG path
function getDecoPath(genre, w, h) {
  switch (genre) {
    case '玄幻': return '<circle cx="'+(w*0.8)+'" cy="'+(h*0.2)+'" r="'+(w*0.3)+'" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="2"/><circle cx="'+(w*0.85)+'" cy="'+(h*0.15)+'" r="'+(w*0.45)+'" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>';
    case '仙侠': return '<path d="M'+(w*0.1)+','+(h*0.9)+' Q'+(w*0.3)+','+(h*0.5)+' '+(w*0.5)+','+(h*0.8)+' Q'+(w*0.7)+','+(h*0.3)+' '+(w*0.9)+','+(h*0.1)+'" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2"/>';
    case '科幻': return '<polygon points="'+(w*0.8)+','+(h*0.1)+' '+(w*0.85)+','+(h*0.2)+' '+(w*0.9)+','+(h*0.1)+'" fill="rgba(0,212,255,0.08)"/><polygon points="'+(w*0.75)+','+(h*0.15)+' '+(w*0.8)+','+(h*0.25)+' '+(w*0.85)+','+(h*0.15)+'" fill="rgba(0,212,255,0.05)"/>';
    case '言情': return '<path d="M'+(w*0.3)+','+(h*0.3)+' C'+(w*0.35)+','+(h*0.2)+' '+(w*0.45)+','+(h*0.2)+' '+(w*0.5)+','+(h*0.3)+' C'+(w*0.55)+','+(h*0.2)+' '+(w*0.65)+','+(h*0.2)+' '+(w*0.7)+','+(h*0.3)+' C'+(w*0.75)+','+(h*0.4)+' '+(w*0.7)+','+(h*0.5)+' '+(w*0.5)+','+(h*0.6)+' C'+(w*0.3)+','+(h*0.5)+' '+(w*0.25)+','+(h*0.4)+' '+(w*0.3)+','+(h*0.3)+'" fill="rgba(255,200,210,0.06)"/>';
    case '悬疑': return '<line x1="'+(w*0.2)+'" y1="'+(h*0.1)+'" x2="'+(w*0.2)+'" y2="'+(h*0.9)+'" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>';
    default: return '';
  }
}

// 获取装饰性图标（SVG path）
function getIconPath(genre, w, h) {
  var s = Math.min(w, h) * 0.15; // 图标大小
  var cx = w * 0.5, cy = h * 0.32;
  var x = cx, y = cy;
  switch (genre) {
    case '玄幻': return '<circle cx="'+x+'" cy="'+y+'" r="'+s+'" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/><circle cx="'+x+'" cy="'+y+'" r="'+(s*0.4)+'" fill="rgba(255,255,255,0.08)"/>';
    case '仙侠': return '<path d="M'+x+','+(y-s)+' L'+(x+s*0.5)+','+(y+s)+' L'+(x-s*0.5)+','+(y+s*0.2)+' L'+(x+s*0.5)+','+(y+s*0.2)+' Z" fill="rgba(100,181,160,0.15)" stroke="rgba(100,181,160,0.3)" stroke-width="1"/>';
    case '都市': return '<rect x="'+(x-s*0.7)+'" y="'+(y-s*0.5)+'" width="'+(s*1.4)+'" height="'+(s*1.2)+'" rx="2" fill="rgba(241,196,15,0.12)" stroke="rgba(241,196,15,0.25)" stroke-width="1.5"/><rect x="'+(x-s*0.3)+'" y="'+(y-s*0.15)+'" width="'+(s*0.6)+'" height="'+(s*0.8)+'" rx="1" fill="rgba(241,196,15,0.18)"/>';
    case '科幻': return '<polygon points="'+x+','+(y-s)+' '+(x+s*0.7)+','+(y+s*0.5)+' '+(x-s*0.7)+','+(y+s*0.5)+'" fill="rgba(0,212,255,0.12)" stroke="rgba(0,212,255,0.25)" stroke-width="1.5"/>';
    case '言情': return '<path d="M'+x+','+(y+s*0.3)+' C'+(x-s*0.7)+','+(y-s*0.3)+' '+(x-s*0.3)+','+(y-s*0.6)+' '+x+','+(y-s*0.2)+' C'+(x+s*0.3)+','+(y-s*0.6)+' '+(x+s*0.7)+','+(y-s*0.3)+' '+x+','+(y+s*0.3)+'" fill="rgba(247,200,210,0.15)" stroke="rgba(247,200,210,0.3)" stroke-width="1.5"/>';
    case '悬疑': return '<circle cx="'+x+'" cy="'+y+'" r="'+(s*0.6)+'" fill="none" stroke="rgba(204,68,68,0.2)" stroke-width="1.5"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" fill="rgba(204,68,68,0.2)" font-size="'+(s*0.9)+'" font-weight="bold">?</text>';
    default: return '<circle cx="'+x+'" cy="'+y+'" r="'+s+'" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>';
  }
}

function generateSVG(novel, palette) {
  var w = 400, h = 560;
  var genre = novel.genres[0];
  var decor = getDecoPath(genre, w, h);
  var icon = getIconPath(genre, w, h);

  // 章节数和状态信息
  var statusText = novel.status.zh;
  var chapterText = novel.chapters + '章';

  // 书名可能的换行
  var title = novel.title.zh;
  var titleLines = [];
  if (title.length > 6) {
    var mid = Math.ceil(title.length / 2);
    titleLines.push(title.slice(0, mid));
    titleLines.push(title.slice(mid));
  } else {
    titleLines.push(title);
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">' +
    '<defs>' +
    '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:'+palette.bg1+'"/>' +
    '<stop offset="100%" style="stop-color:'+palette.bg2+'"/>' +
    '</linearGradient>' +
    '<linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">' +
    '<stop offset="0%" style="stop-color:'+palette.glow+';stop-opacity:0.3"/>' +
    '<stop offset="100%" style="stop-color:'+palette.glow+';stop-opacity:0"/>' +
    '</linearGradient>' +
    '</defs>' +
    '<rect width="'+w+'" height="'+h+'" fill="url(#bg)"/>' +
    '<rect width="'+w+'" height="'+h+'" fill="url(#glow)"/>' +
    decor +
    // 底部信息条
    '<rect x="0" y="'+(h-50)+'" width="'+w+'" height="50" fill="rgba(0,0,0,0.2)"/>' +
    '<text x="20" y="'+(h-20)+'" fill="rgba(255,255,255,0.5)" font-size="12">'+chapterText+'</text>' +
    '<text x="'+(w-20)+'" y="'+(h-20)+'" text-anchor="end" fill="rgba(255,255,255,0.5)" font-size="12">'+statusText+'</text>' +
    // 类型标签
    '<rect x="20" y="20" rx="12" ry="12" width="'+(genre.length*14+20)+'" height="24" fill="'+palette.accent+'" opacity="0.85"/>' +
    '<text x="'+(30)+'" y="36" fill="#fff" font-size="12" font-weight="600">'+genre+'</text>' +
    // 中间装饰图标
    icon +
    // 书名（大号）
    (function(){
      var lines = [];
      for (var i = 0; i < titleLines.length; i++) {
        var lineY = h * 0.56 + i * 42;
        lines.push('<text x="'+(w/2)+'" y="'+lineY+'" text-anchor="middle" fill="#fff" font-size="'+(titleLines.length > 1 ? 24 : 30)+'" font-weight="700">'+titleLines[i]+'</text>');
      }
      return lines.join('');
    })() +
    // 分隔线
    '<line x1="'+(w*0.3)+'" y1="'+(h*0.65)+'" x2="'+(w*0.7)+'" y2="'+(h*0.65)+'" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
    // 作者
    '<text x="'+(w/2)+'" y="'+(h*0.72)+'" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="14">'+novel.author.zh+'</text>' +
    // 评分
    '<text x="'+(w/2)+'" y="'+(h*0.79)+'" text-anchor="middle" fill="#f5a623" font-size="16" font-weight="600">★ '+novel.rating.toFixed(1)+'</text>' +
    '</svg>';
}

// 创建 covers 目录
try { fs.mkdirSync('covers'); } catch(e) {}

// 为每部小说生成 SVG
novels.forEach(function(novel) {
  var palette = getPalette(novel);
  var svg = generateSVG(novel, palette);
  var filename = 'cover_' + novel.id + '.svg';
  fs.writeFileSync('covers/' + filename, svg, 'utf8');
  console.log('✅ 已生成: covers/' + filename + ' (' + novel.title.zh + ')');
});

console.log('\n🎉 共生成 ' + novels.length + ' 个封面');
