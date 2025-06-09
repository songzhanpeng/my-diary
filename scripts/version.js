#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function getVersionInfo() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  const currentVersion = packageJson.version;
  
  // 计算下一个版本号
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  return {
    current: currentVersion,
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`
  };
}

function getCommitsSinceLastTag() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' }).trim();
    return { lastTag, commits: commits.split('\n').filter(Boolean) };
  } catch (error) {
    // 没有标签时获取所有提交
    const commits = execSync('git log --oneline', { encoding: 'utf8' }).trim();
    return { lastTag: null, commits: commits.split('\n').filter(Boolean) };
  }
}

function determineVersionType(commits) {
  const hasBreaking = commits.some(commit => 
    commit.includes('BREAKING CHANGE') || 
    commit.includes('!:') ||
    commit.startsWith('feat!') ||
    commit.startsWith('fix!')
  );
  
  const hasFeature = commits.some(commit => 
    commit.startsWith('feat:') || 
    commit.startsWith('feat(')
  );
  
  if (hasBreaking) return 'major';
  if (hasFeature) return 'minor';
  return 'patch';
}

async function main() {
  console.log('📋 版本管理工具');
  console.log('================');
  
  const versions = getVersionInfo();
  const { lastTag, commits } = getCommitsSinceLastTag();
  const suggestedType = determineVersionType(commits);
  
  console.log(`\n📌 当前版本: ${versions.current}`);
  
  if (lastTag) {
    console.log(`🏷️  上一个标签: ${lastTag}`);
    console.log(`📝 自上次发布以来的提交数量: ${commits.length}`);
  } else {
    console.log('🏷️  这是第一次发布');
    console.log(`📝 总提交数量: ${commits.length}`);
  }
  
  console.log(`💡 建议的版本类型: ${suggestedType}`);
  
  if (commits.length > 0) {
    console.log('\n📝 最近的提交:');
    commits.slice(0, 5).forEach(commit => {
      console.log(`   • ${commit}`);
    });
    
    if (commits.length > 5) {
      console.log(`   ... 还有 ${commits.length - 5} 个提交`);
    }
  }
  
  console.log('\n🔢 可选版本:');
  console.log(`   1. patch: ${versions.patch} (修复)`);
  console.log(`   2. minor: ${versions.minor} (功能)`);
  console.log(`   3. major: ${versions.major} (破坏性更改)`);
  console.log(`   4. 自定义版本`);
  console.log(`   5. 仅更新CHANGELOG`);
  console.log(`   6. 退出`);
  
  const choice = await question('\n请选择 (1-6): ');
  
  let versionType = null;
  let customVersion = null;
  
  switch (choice) {
    case '1':
      versionType = 'patch';
      break;
    case '2':
      versionType = 'minor';
      break;
    case '3':
      versionType = 'major';
      break;
    case '4':
      customVersion = await question('请输入自定义版本号 (如 1.2.3): ');
      if (!/^\d+\.\d+\.\d+/.test(customVersion)) {
        console.error('❌ 无效的版本号格式');
        process.exit(1);
      }
      break;
    case '5':
      await updateChangelog(versions.current, commits);
      console.log('✅ CHANGELOG 已更新');
      rl.close();
      return;
    case '6':
      console.log('👋 退出');
      rl.close();
      return;
    default:
      console.error('❌ 无效选择');
      process.exit(1);
  }
  
  // 询问发布选项
  console.log('\n🚀 发布选项:');
  const dryRun = await question('是否进行干运行测试? (y/N): ');
  const skipTests = await question('是否跳过测试? (y/N): ');
  const updateChangelog = await question('是否更新CHANGELOG? (Y/n): ');
  
  // 生成发布命令
  let command = 'npm run publish:npm';
  
  if (customVersion) {
    // 对于自定义版本，直接设置版本号
    command = `npm version ${customVersion} --no-git-tag-version && ${command} custom`;
  } else {
    command += ` ${versionType}`;
  }
  
  if (dryRun.toLowerCase() === 'y') {
    command += ' --dry-run';
  }
  
  if (skipTests.toLowerCase() === 'y') {
    command += ' --skip-tests';
  }
  
  // 更新CHANGELOG
  if (updateChangelog.toLowerCase() !== 'n') {
    const newVersion = customVersion || versions[versionType];
    await updateChangelogFile(newVersion, commits);
  }
  
  console.log(`\n🔨 执行命令: ${command}`);
  const confirm = await question('确认执行? (Y/n): ');
  
  if (confirm.toLowerCase() !== 'n') {
    console.log('🚀 开始发布...\n');
    try {
      execSync(command, { stdio: 'inherit' });
    } catch (error) {
      console.error('❌ 发布失败:', error.message);
      process.exit(1);
    }
  } else {
    console.log('❌ 已取消发布');
  }
  
  rl.close();
}

async function updateChangelogFile(version, commits) {
  const changelogPath = path.join(__dirname, '../CHANGELOG.md');
  const date = new Date().toISOString().split('T')[0];
  
  let existingChangelog = '';
  if (fs.existsSync(changelogPath)) {
    existingChangelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    existingChangelog = '# Changelog\n\n本文档记录了项目的所有重要更改。\n\n';
  }
  
  // 生成新版本的更改日志
  let newEntry = `## [${version}] - ${date}\n\n`;
  
  if (commits.length > 0) {
    const features = commits.filter(c => c.includes('feat:') || c.includes('feat('));
    const fixes = commits.filter(c => c.includes('fix:') || c.includes('fix('));
    const others = commits.filter(c => !c.includes('feat:') && !c.includes('feat(') && !c.includes('fix:') && !c.includes('fix('));
    
    if (features.length > 0) {
      newEntry += '### ✨ 新功能\n\n';
      features.forEach(commit => {
        const message = commit.substring(commit.indexOf(' ') + 1);
        newEntry += `- ${message}\n`;
      });
      newEntry += '\n';
    }
    
    if (fixes.length > 0) {
      newEntry += '### 🐛 修复\n\n';
      fixes.forEach(commit => {
        const message = commit.substring(commit.indexOf(' ') + 1);
        newEntry += `- ${message}\n`;
      });
      newEntry += '\n';
    }
    
    if (others.length > 0) {
      newEntry += '### 🔧 其他更改\n\n';
      others.forEach(commit => {
        const message = commit.substring(commit.indexOf(' ') + 1);
        newEntry += `- ${message}\n`;
      });
      newEntry += '\n';
    }
  }
  
  // 插入新条目到文件开头（在标题之后）
  const lines = existingChangelog.split('\n');
  const titleIndex = lines.findIndex(line => line.startsWith('# '));
  const insertIndex = titleIndex >= 0 ? titleIndex + 3 : 0;
  
  lines.splice(insertIndex, 0, newEntry);
  
  fs.writeFileSync(changelogPath, lines.join('\n'));
  console.log(`✅ CHANGELOG 已更新，添加了版本 ${version}`);
}

// 运行主程序
if (require.main === module) {
  main().catch(console.error);
} 