import { simpleGit, SimpleGit } from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';
import { DiaryConfig } from './config';

export class GitManager {
  private git: SimpleGit;
  private config: DiaryConfig;

  constructor(config: DiaryConfig) {
    this.config = config;
    this.git = simpleGit(config.diariesDir);
  }

  /**
   * 初始化Git仓库
   */
  async initRepository(): Promise<void> {
    try {
      const isRepo = await this.git.checkIsRepo();
      
      if (!isRepo) {
        console.log('🔄 初始化Git仓库...');
        await this.git.init();
        
        // 创建.gitignore文件
        const gitignorePath = path.join(this.config.diariesDir, '.gitignore');
        const gitignoreContent = `# 系统文件
.DS_Store
Thumbs.db

# 临时文件
*.tmp
*.temp
*.swp
*.swo

# 日志文件
*.log
`;
        await fs.writeFile(gitignorePath, gitignoreContent);
        
        console.log('✅ Git仓库初始化完成');
      }
    } catch (error) {
      console.error('❌ 初始化Git仓库失败:', error);
      throw error;
    }
  }

  /**
   * 添加远程仓库
   */
  async addRemote(remoteUrl: string): Promise<void> {
    try {
      await this.git.addRemote('origin', remoteUrl);
      console.log('✅ 远程仓库添加成功');
    } catch (error) {
      // 如果远程仓库已存在，更新URL
      try {
        await this.git.remote(['set-url', 'origin', remoteUrl]);
        console.log('✅ 远程仓库URL更新成功');
      } catch (updateError) {
        console.error('❌ 设置远程仓库失败:', updateError);
        throw updateError;
      }
    }
  }

  /**
   * 检查仓库状态
   */
  async getStatus(): Promise<any> {
    try {
      return await this.git.status();
    } catch (error) {
      console.error('❌ 获取Git状态失败:', error);
      throw error;
    }
  }

  /**
   * 提交文件
   */
  async commitFile(filePath: string, commitMessage: string): Promise<void> {
    try {
      // 添加文件到暂存区
      await this.git.add(filePath);
      
      // 提交文件
      await this.git.commit(commitMessage);
      
      console.log(`✅ 文件已提交: ${commitMessage}`);
    } catch (error) {
      console.error('❌ 提交文件失败:', error);
      throw error;
    }
  }

  /**
   * 推送到远程仓库
   */
  async pushToRemote(): Promise<void> {
    try {
      if (!this.config.gitRemoteUrl) {
        throw new Error('未设置远程仓库URL');
      }

      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find((remote: any) => remote.name === 'origin');
      
      if (!origin) {
        await this.addRemote(this.config.gitRemoteUrl);
      }

      console.log('🔄 推送到远程仓库...');
      await this.git.push('origin', this.config.gitBranch);
      console.log('✅ 推送成功');
    } catch (error) {
      console.error('❌ 推送失败:', error);
      throw error;
    }
  }

  /**
   * 从远程仓库拉取
   */
  async pullFromRemote(): Promise<void> {
    try {
      if (!this.config.gitRemoteUrl) {
        throw new Error('未设置远程仓库URL');
      }

      console.log('🔄 从远程仓库拉取...');
      await this.git.pull('origin', this.config.gitBranch);
      console.log('✅ 拉取成功');
    } catch (error) {
      console.error('❌ 拉取失败:', error);
      throw error;
    }
  }

  /**
   * 获取提交历史
   */
  async getCommitHistory(limit: number = 10): Promise<any> {
    try {
      return await this.git.log({ maxCount: limit });
    } catch (error) {
      console.error('❌ 获取提交历史失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否有未提交的更改
   */
  async hasUncommittedChanges(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.files.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * 自动提交所有更改
   */
  async commitAll(message: string): Promise<void> {
    try {
      const status = await this.getStatus();
      
      if (status.files.length === 0) {
        console.log('📝 没有需要提交的更改');
        return;
      }

      // 添加所有更改的文件
      await this.git.add('.');
      
      // 提交
      await this.git.commit(message);
      
      console.log(`✅ 已提交 ${status.files.length} 个文件: ${message}`);
      
      // 如果配置了自动推送，则推送到远程仓库
      if (this.config.gitRemoteUrl) {
        await this.pushToRemote();
      }
    } catch (error) {
      console.error('❌ 自动提交失败:', error);
      throw error;
    }
  }
} 