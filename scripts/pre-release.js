#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 预发布检查...');

const errors = [];
const warnings = [];

// 检查Git状态
try {
  execSync('git diff --exit-code', { stdio: 'ignore' });
  execSync('git diff --cached --exit-code', { stdio: 'ignore' });
  console.log('✅ Git状态清洁');
} catch (error) {
  errors.push('存在未提交的更改');
}

// 检查必要文件
const requiredFiles = ['package.json', 'README.md', 'src/index.ts', 'src/cli.ts'];
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, '..', file))) {
    console.log(`✅ ${file} 存在`);
  } else {
    errors.push(`缺少必要文件: ${file}`);
  }
});

// 检查package.json配置
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

if (packageJson.name && packageJson.name !== 'diary-generator') {
  console.log('✅ 包名已设置');
} else {
  errors.push('包名未正确设置');
}

if (packageJson.version) {
  console.log(`✅ 版本号: ${packageJson.version}`);
} else {
  errors.push('版本号未设置');
}

if (packageJson.bin && packageJson.bin.diary) {
  console.log('✅ CLI命令已配置');
} else {
  errors.push('CLI命令未配置');
}

if (packageJson.main) {
  console.log(`✅ 入口文件: ${packageJson.main}`);
} else {
  warnings.push('未设置入口文件');
}

// 检查构建结果
try {
  console.log('📦 检查构建...');
  execSync('npm run build', { stdio: 'ignore' });
  
  if (fs.existsSync(path.join(__dirname, '../dist/cli.js'))) {
    console.log('✅ 构建成功');
  } else {
    errors.push('构建输出不完整');
  }
} catch (error) {
  errors.push('构建失败');
}

// 检查依赖
console.log('📦 检查依赖...');
try {
  execSync('npm audit --audit-level moderate', { stdio: 'ignore' });
  console.log('✅ 依赖安全检查通过');
} catch (error) {
  warnings.push('存在安全漏洞或依赖问题');
}

// 运行测试
console.log('🧪 运行测试...');
try {
  execSync('npm test', { stdio: 'ignore' });
  console.log('✅ 测试通过');
} catch (error) {
  warnings.push('测试失败或无测试');
}

// 检查README
const readmePath = path.join(__dirname, '../README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf8');
  if (readme.includes('npm install -g diary-cli')) {
    console.log('✅ README包含安装说明');
  } else {
    warnings.push('README缺少安装说明');
  }
  
  if (readme.includes('使用') || readme.includes('Usage')) {
    console.log('✅ README包含使用说明');
  } else {
    warnings.push('README缺少使用说明');
  }
}

// 检查CHANGELOG
const changelogPath = path.join(__dirname, '../CHANGELOG.md');
if (fs.existsSync(changelogPath)) {
  console.log('✅ CHANGELOG存在');
} else {
  warnings.push('建议添加CHANGELOG.md');
}

// 检查LICENSE
const licensePath = path.join(__dirname, '../LICENSE');
if (fs.existsSync(licensePath) || packageJson.license) {
  console.log('✅ LICENSE已设置');
} else {
  warnings.push('建议添加LICENSE文件');
}

// 显示结果
console.log('\n📋 检查结果:');

if (errors.length > 0) {
  console.log('\n❌ 错误:');
  errors.forEach(error => console.log(`   • ${error}`));
}

if (warnings.length > 0) {
  console.log('\n⚠️  警告:');
  warnings.forEach(warning => console.log(`   • ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('🎉 所有检查通过，可以发布！');
  process.exit(0);
} else if (errors.length === 0) {
  console.log('✅ 基本检查通过，建议处理警告后再发布');
  process.exit(0);
} else {
  console.log('❌ 存在错误，请修复后再发布');
  process.exit(1);
} 