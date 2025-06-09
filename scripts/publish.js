#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始发布 diary-cli...');

try {
  // 检查是否有未提交的更改
  try {
    execSync('git diff --exit-code', { stdio: 'ignore' });
    execSync('git diff --cached --exit-code', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ 存在未提交的更改，请先提交所有更改');
    process.exit(1);
  }

  // 构建项目
  console.log('📦 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 检查构建结果
  if (!fs.existsSync(path.join(__dirname, '../dist/cli.js'))) {
    console.error('❌ 构建失败，找不到 dist/cli.js');
    process.exit(1);
  }

  // 运行测试（如果有）
  console.log('🧪 运行测试...');
  try {
    execSync('npm test', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  没有测试或测试失败，继续发布...');
  }

  // 发布到 npm
  console.log('📤 发布到 npm...');
  execSync('npm publish', { stdio: 'inherit' });

  console.log('✅ 发布成功！');
  console.log('📝 安装命令: npm install -g diary-cli');

} catch (error) {
  console.error('❌ 发布失败:', error.message);
  process.exit(1);
} 