import * as fs from 'fs-extra';
import * as path from 'path';
import { ConfigManager, DiaryConfig } from './config';
import { GitManager } from './git';

interface DiaryTemplate {
  date: string;
  template: string;
}

export class DiaryGenerator {
  private configManager: ConfigManager;
  private gitManager?: GitManager;
  private config!: DiaryConfig;

  constructor() {
    this.configManager = new ConfigManager();
  }

  /**
   * 初始化配置
   */
  async initialize(): Promise<void> {
    this.config = await this.configManager.getConfig();
    await this.ensureDiariesDirectory();
    
    if (this.config.gitEnabled) {
      this.gitManager = new GitManager(this.config);
      await this.gitManager.initRepository();
    }
  }

  /**
   * 确保日记目录存在
   */
  private async ensureDiariesDirectory(): Promise<void> {
    try {
      await fs.ensureDir(this.config.diariesDir);
    } catch (error) {
      console.error('创建日记目录失败:', error);
    }
  }

  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 格式化日期为中文显示格式
   */
  private formatDateChinese(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${year}年${month}月${day}日 ${weekday}`;
  }

  /**
   * 生成日记模板
   */
  private generateTemplate(date: Date): DiaryTemplate {
    const dateStr = this.formatDateChinese(date);
    
    const template = `# 📅 日记：${dateStr}

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
*生成时间：${new Date().toLocaleString('zh-CN')}*
`;

    return {
      date: this.formatDate(date),
      template
    };
  }

  /**
   * 获取日记文件的目录路径（年/月结构）
   */
  private getDiaryPath(date: Date): { dirPath: string; filename: string; filepath: string } {
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const filename = `${this.formatDate(date)}.md`;
    const dirPath = path.join(this.config.diariesDir, year, month);
    const filepath = path.join(dirPath, filename);
    
    return { dirPath, filename, filepath };
  }

  /**
   * 创建新的日记文件
   */
  async createDiary(date?: Date): Promise<string> {
    const targetDate = date || new Date();
    const diary = this.generateTemplate(targetDate);
    const { dirPath, filename, filepath } = this.getDiaryPath(targetDate);

    try {
      // 检查文件是否已存在
      if (await fs.pathExists(filepath)) {
        console.log(`📝 日记文件已存在: ${filename}`);
        console.log(`📂 文件路径: ${filepath}`);
        return filepath;
      }

      // 确保年/月目录存在
      await fs.ensureDir(dirPath);

      // 创建新的日记文件
      await fs.writeFile(filepath, diary.template, 'utf-8');
      console.log(`✅ 成功创建日记文件: ${filename}`);
      console.log(`📂 文件路径: ${filepath}`);
      
      // 如果启用了Git，自动提交
      if (this.config.gitEnabled && this.config.autoCommit) {
        await this.commitDiary(filepath, targetDate);
      }
      
      return filepath;
    } catch (error) {
      console.error('创建日记文件失败:', error);
      throw error;
    }
  }

  /**
   * 递归获取所有日记文件
   */
  private async getAllDiaryFiles(dir: string, relativePath: string = ''): Promise<Array<{ file: string; path: string }>> {
    const files: Array<{ file: string; path: string }> = [];
    
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          // 递归获取子目录中的文件
          const subFiles = await this.getAllDiaryFiles(fullPath, path.join(relativePath, item));
          files.push(...subFiles);
        } else if (item.endsWith('.md')) {
          // 添加 markdown 文件
          files.push({
            file: item,
            path: relativePath ? path.join(relativePath, item) : item
          });
        }
      }
    } catch (error) {
      // 目录不存在或无法读取，返回空数组
      return [];
    }
    
    return files;
  }

  /**
   * 列出所有日记文件
   */
  async listDiaries(): Promise<string[]> {
    try {
      const diaryFiles = await this.getAllDiaryFiles(this.config.diariesDir);
      
      if (diaryFiles.length === 0) {
        console.log('📭 暂无日记文件');
        return [];
      }

      // 按日期排序，最新的在前面
      diaryFiles.sort((a, b) => {
        const dateA = a.file.replace('.md', '');
        const dateB = b.file.replace('.md', '');
        return dateB.localeCompare(dateA);
      });

      console.log('📚 现有日记文件:');
      diaryFiles.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.path} (${item.file.replace('.md', '')})`);
      });

      return diaryFiles.map(item => item.path);
    } catch (error) {
      console.error('读取日记目录失败:', error);
      return [];
    }
  }

  /**
   * 从日记文件中提取一句话情绪
   */
  async extractEmotion(filePath: string): Promise<string | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.includes('## 💭 一句话情绪')) {
          // 查找下一行的内容
          for (let j = i + 1; j < lines.length; j++) {
            const emotionLine = lines[j].trim();
            if (emotionLine.startsWith('>') && emotionLine.length > 1) {
              return emotionLine.substring(1).trim();
            }
            if (emotionLine && !emotionLine.startsWith('>')) {
              break; // 遇到非情绪内容，停止搜索
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.warn(`读取日记文件失败: ${filePath}`);
      return null;
    }
  }

  /**
   * 生成Git提交信息
   */
  async generateCommitMessage(filePath: string, date: Date): Promise<string> {
    if (this.config.useEmotionAsCommit) {
      const emotion = await this.extractEmotion(filePath);
      if (emotion) {
        return `📝 ${this.formatDateChinese(date)}: ${emotion}`;
      }
    }
    
    return this.config.defaultCommitMessage + ` - ${this.formatDateChinese(date)}`;
  }

  /**
   * 提交日记到Git
   */
  async commitDiary(filePath: string, date: Date, customMessage?: string): Promise<void> {
    if (!this.config.gitEnabled || !this.gitManager) {
      return;
    }

    try {
      const commitMessage = customMessage || await this.generateCommitMessage(filePath, date);
      const relativePath = path.relative(this.config.diariesDir, filePath);
      
      await this.gitManager.commitFile(relativePath, commitMessage);
      
      if (this.config.autoCommit && this.config.gitRemoteUrl) {
        await this.gitManager.pushToRemote();
      }
    } catch (error) {
      console.warn('Git提交失败:', error);
    }
  }

  /**
   * 创建指定日期范围内的日记模板
   */
  async createBatchDiaries(startDate: Date, endDate: Date): Promise<void> {
    const current = new Date(startDate);
    const createdFiles: string[] = [];

    while (current <= endDate) {
      try {
        const filepath = await this.createDiary(new Date(current));
        createdFiles.push(path.basename(filepath));
      } catch (error) {
        console.error(`创建 ${this.formatDate(current)} 的日记失败:`, error);
      }
      
      current.setDate(current.getDate() + 1);
    }

    console.log(`\n📋 批量创建完成，共处理 ${createdFiles.length} 个文件`);
  }
}

// 命令行参数处理
async function main() {
  const generator = new DiaryGenerator();
  const args = process.argv.slice(2);

  if (args.length === 0) {
    // 默认创建今天的日记
    await generator.createDiary();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'today':
      await generator.createDiary();
      break;
      
    case 'yesterday':
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await generator.createDiary(yesterday);
      break;
      
    case 'date':
      if (args[1]) {
        try {
          const date = new Date(args[1]);
          if (isNaN(date.getTime())) {
            console.error('❌ 无效的日期格式，请使用 YYYY-MM-DD 格式');
            return;
          }
          await generator.createDiary(date);
        } catch (error) {
          console.error('❌ 日期解析失败:', error);
        }
      } else {
        console.error('❌ 请提供日期参数，格式: YYYY-MM-DD');
      }
      break;
      
    case 'list':
      await generator.listDiaries();
      break;
      
    case 'batch':
      if (args[1] && args[2]) {
        try {
          const startDate = new Date(args[1]);
          const endDate = new Date(args[2]);
          
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('❌ 无效的日期格式，请使用 YYYY-MM-DD 格式');
            return;
          }
          
          if (startDate > endDate) {
            console.error('❌ 开始日期不能晚于结束日期');
            return;
          }
          
          await generator.createBatchDiaries(startDate, endDate);
        } catch (error) {
          console.error('❌ 批量创建失败:', error);
        }
      } else {
        console.error('❌ 请提供开始和结束日期，格式: npm run new-diary batch YYYY-MM-DD YYYY-MM-DD');
      }
      break;
      
    case 'help':
    case '--help':
    case '-h':
      console.log(`
📝 日记生成器使用说明

命令格式:
  npm run new-diary [命令] [参数]

可用命令:
  (无参数)           创建今天的日记
  today             创建今天的日记  
  yesterday         创建昨天的日记
  date YYYY-MM-DD   创建指定日期的日记
  list              列出所有日记文件
  batch START END   批量创建日期范围内的日记
  help              显示此帮助信息

示例:
  npm run new-diary
  npm run new-diary today
  npm run new-diary date 2024-01-15
  npm run new-diary batch 2024-01-01 2024-01-07
  npm run new-diary list
      `);
      break;
      
    default:
      console.error(`❌ 未知命令: ${command}`);
      console.log('使用 "npm run new-diary help" 查看帮助信息');
  }
}

// 运行主程序
if (require.main === module) {
  main().catch(console.error);
}

// DiaryGenerator is already exported above 