# 📝 日记生成器

一个用 TypeScript 编写的每日日记模板生成工具，帮助您快速创建结构化的日记文件。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 使用方法

```bash
# 创建今天的日记
npm run new-diary

# 创建今天的日记（显式命令）
npm run new-diary today

# 创建昨天的日记
npm run new-diary yesterday

# 创建指定日期的日记
npm run new-diary date 2024-01-15

# 列出所有日记文件
npm run new-diary list

# 批量创建日期范围内的日记
npm run new-diary batch 2024-01-01 2024-01-07

# 查看帮助信息
npm run new-diary help
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

- ✅ 自动创建年/月层级目录结构
- ✅ 支持中文日期格式显示
- ✅ 防止重复创建同一天的日记
- ✅ 支持批量创建多天日记
- ✅ 递归列出所有已创建的日记文件
- ✅ 完整的命令行界面
- ✅ TypeScript 类型安全

## 🔧 自定义

您可以在 `src/index.ts` 中修改 `generateTemplate` 方法来自定义日记模板格式。 