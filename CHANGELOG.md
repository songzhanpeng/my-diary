# Changelog

本文档记录了 diary-cli 项目的所有重要更改。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2025-06-09

### ✨ 新功能

- 🎉 初始版本发布
- 📝 智能日记生成器，支持本地存储和 Git 同步
- 🗂️ 年/月层级目录结构组织
- 📅 支持中文日期格式显示
- 🔄 完整的 Git 集成功能
- 💭 智能提交信息：支持使用"一句话情绪"作为提交信息
- ⚙️ 配置管理系统
- 🎯 命令行界面 (CLI)
- 📦 NPM 包发布

### 🛠️ CLI 命令

- `diary new` - 创建新的日记
- `diary list` - 列出所有日记文件
- `diary batch` - 批量创建日记
- `diary config` - 配置管理
- `diary git` - Git 仓库管理

### 🔧 配置选项

- 本地存储目录配置
- Git 远程仓库配置
- 自动提交设置
- 智能提交信息生成
- 自定义提交信息模板

### 📋 发布工具

- 自动版本管理
- Git 标签自动创建
- CHANGELOG 自动生成
- GitHub Actions 自动发布流程
- 预发布检查脚本 