#!/usr/bin/env node

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { DiaryGenerator } from './index';
import { ConfigManager } from './config';
import { GitManager } from './git';

const program = new Command();

program
  .name('diary')
  .description('智能日记生成器 - 支持本地存储和Git同步')
  .version('1.0.0');

// 创建日记命令
program
  .command('new')
  .alias('n')
  .description('创建新的日记')
  .option('-d, --date <date>', '指定日期 (YYYY-MM-DD)')
  .option('-m, --message <message>', '自定义Git提交信息')
  .action(async (options) => {
    try {
      const generator = new DiaryGenerator();
      await generator.initialize();
      
      let date: Date | undefined;
      if (options.date) {
        date = new Date(options.date);
        if (isNaN(date.getTime())) {
          console.error(chalk.red('❌ 无效的日期格式，请使用 YYYY-MM-DD 格式'));
          process.exit(1);
        }
      }
      
      const filepath = await generator.createDiary(date);
      
      // 如果启用了Git但没有自动提交，询问是否手动提交
      const config = await new ConfigManager().getConfig();
      if (config.gitEnabled && !config.autoCommit) {
        const { shouldCommit } = await inquirer.prompt([{
          type: 'confirm',
          name: 'shouldCommit',
          message: '是否要提交到Git仓库？',
          default: false
        }]);
        
        if (shouldCommit) {
          let commitMessage = options.message;
          if (!commitMessage) {
            const { message } = await inquirer.prompt([{
              type: 'input',
              name: 'message',
              message: '请输入提交信息（留空使用默认）:',
            }]);
            commitMessage = message;
          }
          
          await generator.commitDiary(filepath, date || new Date(), commitMessage);
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ 创建日记失败:'), error);
      process.exit(1);
    }
  });

// 列出日记命令
program
  .command('list')
  .alias('ls')
  .description('列出所有日记文件')
  .action(async () => {
    try {
      const generator = new DiaryGenerator();
      await generator.initialize();
      await generator.listDiaries();
    } catch (error) {
      console.error(chalk.red('❌ 列出日记失败:'), error);
      process.exit(1);
    }
  });

// 批量创建命令
program
  .command('batch')
  .description('批量创建日记')
  .option('-s, --start <date>', '开始日期 (YYYY-MM-DD)', 'required')
  .option('-e, --end <date>', '结束日期 (YYYY-MM-DD)', 'required')
  .action(async (options) => {
    if (!options.start || !options.end) {
      console.error(chalk.red('❌ 请提供开始和结束日期'));
      program.help();
      return;
    }
    
    try {
      const startDate = new Date(options.start);
      const endDate = new Date(options.end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error(chalk.red('❌ 无效的日期格式，请使用 YYYY-MM-DD 格式'));
        process.exit(1);
      }
      
      if (startDate > endDate) {
        console.error(chalk.red('❌ 开始日期不能晚于结束日期'));
        process.exit(1);
      }
      
      const generator = new DiaryGenerator();
      await generator.initialize();
      await generator.createBatchDiaries(startDate, endDate);
    } catch (error) {
      console.error(chalk.red('❌ 批量创建失败:'), error);
      process.exit(1);
    }
  });

// 配置管理命令
const configCmd = program
  .command('config')
  .description('配置管理');

configCmd
  .command('show')
  .description('显示当前配置')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      await configManager.showConfig();
    } catch (error) {
      console.error(chalk.red('❌ 显示配置失败:'), error);
      process.exit(1);
    }
  });

configCmd
  .command('set')
  .description('设置配置')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const currentConfig = await configManager.getConfig();
      
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'diariesDir',
          message: '日记存储目录:',
          default: currentConfig.diariesDir
        },
        {
          type: 'confirm',
          name: 'gitEnabled',
          message: '启用Git同步:',
          default: currentConfig.gitEnabled
        }
      ]);
      
      if (answers.gitEnabled) {
        const gitAnswers = await inquirer.prompt([
          {
            type: 'input',
            name: 'gitRemoteUrl',
            message: 'Git远程仓库URL:',
            default: currentConfig.gitRemoteUrl
          },
          {
            type: 'input',
            name: 'gitBranch',
            message: 'Git分支:',
            default: currentConfig.gitBranch
          },
          {
            type: 'confirm',
            name: 'autoCommit',
            message: '自动提交:',
            default: currentConfig.autoCommit
          },
          {
            type: 'confirm',
            name: 'useEmotionAsCommit',
            message: '使用一句话情绪作为提交信息:',
            default: currentConfig.useEmotionAsCommit
          },
          {
            type: 'input',
            name: 'defaultCommitMessage',
            message: '默认提交信息:',
            default: currentConfig.defaultCommitMessage
          }
        ]);
        
        Object.assign(answers, gitAnswers);
      }
      
      await configManager.saveConfig(answers);
    } catch (error) {
      console.error(chalk.red('❌ 设置配置失败:'), error);
      process.exit(1);
    }
  });

configCmd
  .command('reset')
  .description('重置配置为默认值')
  .action(async () => {
    try {
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: '确定要重置所有配置吗？',
        default: false
      }]);
      
      if (confirm) {
        const configManager = new ConfigManager();
        await configManager.resetConfig();
      }
    } catch (error) {
      console.error(chalk.red('❌ 重置配置失败:'), error);
      process.exit(1);
    }
  });

// Git管理命令
const gitCmd = program
  .command('git')
  .description('Git仓库管理');

gitCmd
  .command('status')
  .description('查看Git状态')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.getConfig();
      
      if (!config.gitEnabled) {
        console.log(chalk.yellow('⚠️  Git功能未启用'));
        return;
      }
      
      const gitManager = new GitManager(config);
      const status = await gitManager.getStatus();
      
      console.log(chalk.blue('📋 Git状态:'));
      console.log(`当前分支: ${status.current}`);
      console.log(`跟踪分支: ${status.tracking || '无'}`);
      console.log(`未暂存文件: ${status.not_added.length}`);
      console.log(`已暂存文件: ${status.staged.length}`);
      console.log(`已修改文件: ${status.modified.length}`);
    } catch (error) {
      console.error(chalk.red('❌ 获取Git状态失败:'), error);
      process.exit(1);
    }
  });

gitCmd
  .command('commit')
  .description('提交所有更改')
  .option('-m, --message <message>', '提交信息')
  .action(async (options) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.getConfig();
      
      if (!config.gitEnabled) {
        console.log(chalk.yellow('⚠️  Git功能未启用'));
        return;
      }
      
      const gitManager = new GitManager(config);
      
      let message = options.message;
      if (!message) {
        const { inputMessage } = await inquirer.prompt([{
          type: 'input',
          name: 'inputMessage',
          message: '请输入提交信息:',
          default: config.defaultCommitMessage
        }]);
        message = inputMessage;
      }
      
      await gitManager.commitAll(message);
    } catch (error) {
      console.error(chalk.red('❌ 提交失败:'), error);
      process.exit(1);
    }
  });

gitCmd
  .command('push')
  .description('推送到远程仓库')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.getConfig();
      
      if (!config.gitEnabled || !config.gitRemoteUrl) {
        console.log(chalk.yellow('⚠️  Git功能未启用或未设置远程仓库'));
        return;
      }
      
      const gitManager = new GitManager(config);
      await gitManager.pushToRemote();
    } catch (error) {
      console.error(chalk.red('❌ 推送失败:'), error);
      process.exit(1);
    }
  });

gitCmd
  .command('pull')
  .description('从远程仓库拉取')
  .action(async () => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.getConfig();
      
      if (!config.gitEnabled || !config.gitRemoteUrl) {
        console.log(chalk.yellow('⚠️  Git功能未启用或未设置远程仓库'));
        return;
      }
      
      const gitManager = new GitManager(config);
      await gitManager.pullFromRemote();
    } catch (error) {
      console.error(chalk.red('❌ 拉取失败:'), error);
      process.exit(1);
    }
  });

// 快捷命令（兼容旧版本）
program
  .argument('[command]', '兼容命令')
  .argument('[...args]', '命令参数')
  .action(async (command, args) => {
    if (!command) {
      // 默认创建今天的日记
      await program.parseAsync(['node', 'cli.js', 'new']);
      return;
    }
    
    // 兼容旧版本命令
    switch (command) {
      case 'today':
        await program.parseAsync(['node', 'cli.js', 'new']);
        break;
      case 'yesterday':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await program.parseAsync(['node', 'cli.js', 'new', '-d', yesterday.toISOString().split('T')[0]]);
        break;
      case 'date':
        if (args[0]) {
          await program.parseAsync(['node', 'cli.js', 'new', '-d', args[0]]);
        } else {
          console.error(chalk.red('❌ 请提供日期参数'));
        }
        break;
      case 'list':
        await program.parseAsync(['node', 'cli.js', 'list']);
        break;
      case 'batch':
        if (args[0] && args[1]) {
          await program.parseAsync(['node', 'cli.js', 'batch', '-s', args[0], '-e', args[1]]);
        } else {
          console.error(chalk.red('❌ 请提供开始和结束日期'));
        }
        break;
      case 'help':
        program.help();
        break;
      default:
        console.error(chalk.red(`❌ 未知命令: ${command}`));
        program.help();
    }
  });

// 解析命令行参数
program.parse(); 