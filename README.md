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

```bash
# 更新版本号
npm version patch  # 或 minor, major

# 发布
npm run publish:npm
```

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

## 🔧 自定义

要自定义日记模板格式，请修改 `src/index.ts` 中的 `generateTemplate` 方法。 