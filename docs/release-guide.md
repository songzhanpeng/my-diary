# 📋 发布指南

这份指南将帮助您了解如何使用 diary-cli 的自动发布系统。

## 🚀 快速开始

### 1. 准备工作

确保您的开发环境已经配置好：

```bash
# 克隆仓库
git clone https://github.com/your-username/diary-cli.git
cd diary-cli

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 配置发布环境

#### NPM Token
```bash
# 登录到 npm
npm login

# 或者设置环境变量
export NPM_TOKEN=your_npm_token
```

#### GitHub Token (可选)
如果要自动创建 GitHub Release：
```bash
# 安装 GitHub CLI
gh auth login

# 或者设置环境变量
export GITHUB_TOKEN=your_github_token
```

## 📝 发布流程

### 方式一：交互式发布（推荐）

```bash
npm run release
```

这将启动交互式发布流程：
1. 📋 显示当前版本信息
2. 📝 分析提交历史，建议版本类型
3. 🔢 让您选择版本类型（patch/minor/major）
4. ⚙️ 配置发布选项（干运行、跳过测试等）
5. 📖 自动更新 CHANGELOG
6. 🚀 执行完整发布流程

### 方式二：快速发布

```bash
# 发布 patch 版本（修复）
npm run release:patch

# 发布 minor 版本（新功能）
npm run release:minor

# 发布 major 版本（破坏性更改）
npm run release:major
```

### 方式三：手动控制

```bash
# 仅预发布检查
npm run prerelease

# 仅版本管理（不发布）
npm run version:manage

# 自定义发布选项
npm run publish:npm patch --dry-run --skip-tests
```

## 🔧 发布选项

### 版本类型
- `patch`: 修复版本 (1.0.0 → 1.0.1)
- `minor`: 功能版本 (1.0.0 → 1.1.0)  
- `major`: 主版本 (1.0.0 → 2.0.0)
- `custom`: 自定义版本号

### 发布标志
- `--dry-run`: 干运行模式，不会实际发布
- `--skip-tests`: 跳过测试步骤
- `--no-changelog`: 不更新 CHANGELOG

## 📋 自动化检查

发布脚本会自动进行以下检查：

### 预发布检查
- ✅ Git 状态（是否有未提交更改）
- ✅ 必要文件存在性
- ✅ package.json 配置
- ✅ 构建成功
- ✅ 依赖安全检查
- ✅ 测试运行
- ✅ README 和文档完整性

### 版本管理
- 📊 分析提交历史
- 💡 智能版本建议
- 📝 自动生成 CHANGELOG
- 🏷️ 创建 Git 标签
- ⬆️ 推送到远程仓库

## 🏷️ 自动标签规则

脚本会根据提交信息自动建议版本类型：

### Major 版本 (破坏性更改)
```
feat!: 重新设计 CLI 接口
fix!: 移除已废弃的 API
feat: 新功能 BREAKING CHANGE: 移除旧配置格式
```

### Minor 版本 (新功能)
```
feat: 添加批量导出功能
feat(git): 支持自定义分支
```

### Patch 版本 (修复)
```
fix: 修复日期格式化问题
fix(cli): 解决命令行参数解析错误
docs: 更新 README
chore: 更新依赖
```

## 📖 CHANGELOG 管理

### 自动生成
脚本会自动分析提交历史并生成 CHANGELOG 条目：

```markdown
## [1.1.0] - 2025-06-09

### ✨ 新功能
- feat: 添加批量导出功能
- feat(git): 支持自定义分支

### 🐛 修复  
- fix: 修复日期格式化问题
- fix(cli): 解决命令行参数解析错误

### 🔧 其他更改
- docs: 更新 README
- chore: 更新依赖
```

### 手动编辑
您也可以在发布前手动编辑 CHANGELOG.md 文件。

## 🔄 GitHub Actions

项目配置了自动发布工作流 `.github/workflows/release.yml`：

### 触发条件
当推送 Git 标签时自动触发：
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 工作流程
1. 🔍 检出代码
2. 📦 安装依赖
3. 🧪 运行测试
4. 🏗️ 构建项目
5. 📤 发布到 NPM
6. 📋 创建 GitHub Release
7. ✅ 测试全局安装

## 🚨 故障排除

### 常见问题

#### 1. NPM 发布失败
```bash
# 检查登录状态
npm whoami

# 重新登录
npm logout
npm login
```

#### 2. Git 推送失败
```bash
# 检查远程仓库配置
git remote -v

# 重新设置远程仓库
git remote set-url origin https://github.com/your-username/diary-cli.git
```

#### 3. 版本号冲突
```bash
# 删除本地标签
git tag -d v1.0.0

# 删除远程标签  
git push origin :refs/tags/v1.0.0

# 重新发布
npm run release
```

#### 4. 构建失败
```bash
# 清理并重新构建
rm -rf dist node_modules
npm install
npm run build
```

### 回滚发布
如果发布出现问题，脚本会自动回滚：
- 撤销版本号更改
- 删除本地 Git 标签
- 保持工作区清洁

### 手动回滚
```bash
# 撤销版本更改
git reset --hard HEAD~1

# 删除标签
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# 从 NPM 撤销（24小时内）
npm unpublish diary-cli@1.0.0
```

## 📈 最佳实践

### 1. 提交信息规范
使用 [Conventional Commits](https://conventionalcommits.org/) 规范：
```
feat: 添加新功能
fix: 修复问题
docs: 更新文档
style: 代码格式化
refactor: 重构代码
test: 添加测试
chore: 维护任务
```

### 2. 发布前检查清单
- [ ] 所有功能已测试
- [ ] 文档已更新
- [ ] CHANGELOG 已准备
- [ ] 版本号符合语义化版本规范
- [ ] Git 工作区干净

### 3. 发布频率建议
- 🐛 Bug 修复：及时发布 patch 版本
- ✨ 新功能：定期发布 minor 版本
- 💥 破坏性更改：谨慎发布 major 版本

### 4. 版本命名
- 使用语义化版本: `MAJOR.MINOR.PATCH`
- 预发布版本: `1.0.0-alpha.1`, `1.0.0-beta.1`, `1.0.0-rc.1`
- 无需手动添加 `v` 前缀，脚本会自动处理 