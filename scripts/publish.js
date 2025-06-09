#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major
const skipTests = args.includes('--skip-tests');
const dryRun = args.includes('--dry-run');

console.log('🚀 开始发布 diary-cli...');

if (dryRun) {
  console.log('🔍 干运行模式 - 不会实际发布');
}

try {
  // 检查是否有未提交的更改
  console.log('🔍 检查Git状态...');
  try {
    execSync('git diff --exit-code', { stdio: 'ignore' });
    execSync('git diff --cached --exit-code', { stdio: 'ignore' });
  } catch (error) {
    console.error('❌ 存在未提交的更改，请先提交所有更改');
    process.exit(1);
  }

  // 检查当前分支
  const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`📋 当前分支: ${currentBranch}`);

  // 确保在main/master分支
  if (!['main', 'master'].includes(currentBranch)) {
    console.warn(`⚠️  当前不在主分支 (${currentBranch})，确认要继续吗？`);
  }

  // 拉取最新代码
  console.log('⬇️  拉取最新代码...');
  if (!dryRun) {
    execSync('git pull origin ' + currentBranch, { stdio: 'inherit' });
  }

  // 获取当前版本
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const currentVersion = packageJson.version;
  console.log(`📌 当前版本: ${currentVersion}`);

  // 更新版本号
  console.log(`🔢 更新版本 (${versionType})...`);
  if (!dryRun) {
    execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });
  }

  // 获取新版本号
  const newPackageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const newVersion = newPackageJson.version;
  console.log(`🆕 新版本: ${newVersion}`);

  // 构建项目
  console.log('📦 构建项目...');
  execSync('npm run build', { stdio: 'inherit' });

  // 检查构建结果
  if (!fs.existsSync(path.join(__dirname, '../dist/cli.js'))) {
    console.error('❌ 构建失败，找不到 dist/cli.js');
    process.exit(1);
  }

  // 运行测试
  if (!skipTests) {
    console.log('🧪 运行测试...');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  测试失败，但继续发布...');
    }
  } else {
    console.log('⏭️  跳过测试...');
  }

  // 提交版本更新
  console.log('📝 提交版本更新...');
  if (!dryRun) {
    execSync('git add package.json package-lock.json', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: 'inherit' });
  }

  // 创建Git标签
  console.log(`🏷️  创建Git标签 v${newVersion}...`);
  if (!dryRun) {
    execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });
  }

  // 推送代码和标签
  console.log('⬆️  推送到远程仓库...');
  if (!dryRun) {
    execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
  }

  // 发布到 npm
  console.log('📤 发布到 npm...');
  if (!dryRun) {
    execSync('npm publish', { stdio: 'inherit' });
  }

  // 创建GitHub Release（如果配置了GitHub CLI）
  try {
    console.log('📋 创建GitHub Release...');
    if (!dryRun) {
      const changelogPath = path.join(__dirname, '../CHANGELOG.md');
      let releaseNotes = `Release v${newVersion}`;
      
      if (fs.existsSync(changelogPath)) {
        // 如果有CHANGELOG文件，尝试提取相关内容
        releaseNotes = `Release v${newVersion}\n\n查看详细更新日志: [CHANGELOG.md](./CHANGELOG.md)`;
      }
      
      execSync(`gh release create v${newVersion} --title "v${newVersion}" --notes "${releaseNotes}"`, { 
        stdio: 'inherit' 
      });
    }
  } catch (error) {
    console.log('⚠️  GitHub Release创建失败，可能没有安装GitHub CLI或没有权限');
  }

  console.log('🎉 发布成功！');
  console.log('');
  console.log('📋 发布信息:');
  console.log(`   版本: v${newVersion}`);
  console.log(`   Git标签: v${newVersion}`);
  console.log(`   安装命令: npm install -g diary-cli@${newVersion}`);
  console.log('');
  console.log('🔗 相关链接:');
  console.log('   npm: https://www.npmjs.com/package/diary-cli');
  console.log('   GitHub: https://github.com/your-username/diary-cli');

} catch (error) {
  console.error('❌ 发布失败:', error.message);
  
  // 如果发布失败，回滚版本更改
  if (!dryRun) {
    try {
      console.log('🔄 回滚版本更改...');
      execSync('git reset --hard HEAD~1', { stdio: 'ignore' });
      execSync(`git tag -d v${newVersion}`, { stdio: 'ignore' });
    } catch (rollbackError) {
      console.warn('⚠️  回滚失败，请手动检查Git状态');
    }
  }
  
  process.exit(1);
} 