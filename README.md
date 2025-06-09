# 📝 Diary CLI

一个智能的日记生成器 CLI 工具，支持本地存储和 Git 同步。用 TypeScript 编写，提供完整的命令行界面。

## 🚀 快速开始

### 全局安装

```bash
npm install -g diary-cli
```

### 本地开发

```bash
git clone https://github.com/your-username/diary-cli.git
cd diary-cli
npm install
npm run build
npm link  # 链接到全局命令
```

### 发布到 npm

#### 🚀 快速发布

```bash
# 交互式版本管理和发布
npm run release

# 快速发布 patch 版本
npm run release:patch

# 快速发布 minor 版本  
npm run release:minor

# 快速发布 major 版本
npm run release:major

# 干运行测试（不会实际发布）
npm run release:dry
```

#### 🔧 高级发布选项

```bash
# 预发布检查
npm run prerelease

# 手动发布脚本（支持更多选项）
npm run publish:npm [patch|minor|major] [--dry-run] [--skip-tests]

# 仅版本管理（不发布）
npm run version:manage
```

#### 📋 发布流程

1. **自动检查**：Git状态、构建、测试、依赖安全
2. **版本管理**：根据提交自动建议版本类型
3. **更新CHANGELOG**：自动生成变更日志
4. **创建Git标签**：自动打标签并推送
5. **发布npm**：自动发布到npm仓库
6. **GitHub Release**：自动创建GitHub发布页面

#### 🏷️ 自动标签

- 支持语义化版本 (semantic versioning)
- 根据提交信息自动建议版本类型：
  - `feat:` → minor版本
  - `fix:` → patch版本  
  - `BREAKING CHANGE` → major版本
- 自动创建Git标签: `v1.0.0`
- 自动推送标签到远程仓库

### 基本使用

```bash
# 创建今天的日记
diary new
# 或者简写
diary

# 创建指定日期的日记
diary new -d 2024-01-15

# 列出所有日记文件
diary list

# 批量创建日记
diary batch -s 2024-01-01 -e 2024-01-07

# 查看帮助
diary --help
```

### Git 功能

```bash
# 配置 Git 同步
diary config set

# 查看当前配置
diary config show

# Git 状态
diary git status

# 提交所有更改
diary git commit -m "更新日记"

# 推送到远程仓库
diary git push

# 从远程仓库拉取
diary git pull
```

## 📁 目录结构

```
my-diary/
├── src/
│   └── index.ts          # 主要脚本文件
├── diaries/              # 日记文件存储目录（自动创建）
│   └── 2024/            # 年份目录
│       ├── 01/          # 月份目录
│       │   ├── 2024-01-15.md
│       │   └── 2024-01-16.md
│       └── 12/
│           └── 2024-12-25.md
├── dist/                 # 编译后的文件
├── package.json
├── tsconfig.json
└── README.md
```

## 📋 日记模板格式

生成的日记文件包含以下结构：

```markdown
# 📅 日记：2024年1月15日 周一

## ✅ 三件事总结
1. 
2. 
3. 

## 💭 一句话情绪
> 

## 📌 明日计划
- 
- 

---
*生成时间：2024/1/15 下午8:30:45*
```

## 🛠️ 开发

```bash
# 编译 TypeScript
npm run build

# 直接运行（开发模式）
npm run dev

# 运行编译后的文件
npm start
```

## 📝 功能特性

### 📁 本地存储
- ✅ 自动创建年/月层级目录结构
- ✅ 支持中文日期格式显示
- ✅ 防止重复创建同一天的日记
- ✅ 支持批量创建多天日记
- ✅ 递归列出所有已创建的日记文件

### 🔄 Git 同步
- ✅ 自动初始化 Git 仓库
- ✅ 支持远程仓库同步
- ✅ 自动/手动提交选择
- ✅ 使用"一句话情绪"作为提交信息
- ✅ 支持自定义提交信息
- ✅ Git 状态查看和管理

### 🛠️ 其他特性
- ✅ 完整的命令行界面
- ✅ 交互式配置管理
- ✅ TypeScript 类型安全
- ✅ 向后兼容旧版本命令
- ✅ 多彩的控制台输出

## 📋 配置说明

配置文件位于 `~/.diary-cli/config.json`，支持以下选项：

```json
{
  "diariesDir": "/path/to/diaries",           // 日记存储目录
  "gitEnabled": false,                        // 是否启用Git功能
  "gitRemoteUrl": "https://github.com/...",  // Git远程仓库URL
  "gitBranch": "main",                        // Git分支
  "autoCommit": false,                        // 是否自动提交
  "useEmotionAsCommit": false,                // 是否使用情绪作为提交信息
  "defaultCommitMessage": "📝 更新日记"        // 默认提交信息
}
```

## 🔄 Git 工作流程

1. **首次设置**：运行 `diary config set` 配置 Git 仓库
2. **创建日记**：`diary new` 创建日记文件
3. **自动提交**：如果启用自动提交，将自动同步到仓库
4. **手动管理**：使用 `diary git` 系列命令手动管理

## 📖 命令参考

### 基础命令
- `diary new` - 创建今天的日记
- `diary new -d YYYY-MM-DD` - 创建指定日期的日记
- `diary list` - 列出所有日记文件
- `diary batch -s START -e END` - 批量创建日记

### 配置命令
- `diary config show` - 显示当前配置
- `diary config set` - 交互式设置配置
- `diary config reset` - 重置配置为默认值

### Git 命令
- `diary git status` - 查看Git状态
- `diary git commit` - 提交所有更改
- `diary git push` - 推送到远程仓库
- `diary git pull` - 从远程仓库拉取

## 📚 文档

- [📋 发布指南](./docs/release-guide.md) - 详细的发布流程和最佳实践
- [📖 API 文档](./src/) - 源代码和API说明
- [📝 更新日志](./CHANGELOG.md) - 版本更新记录

## 🔧 自定义

要自定义日记模板格式，请修改 `src/index.ts` 中的 `generateTemplate` 方法。

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'feat: add amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

请使用 [Conventional Commits](https://conventionalcommits.org/) 规范提交信息。

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。 