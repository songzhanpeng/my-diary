import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface DiaryConfig {
  diariesDir: string;
  gitEnabled: boolean;
  gitRemoteUrl?: string;
  gitBranch: string;
  autoCommit: boolean;
  useEmotionAsCommit: boolean;
  defaultCommitMessage: string;
}

export class ConfigManager {
  private configPath: string;
  private defaultConfig: DiaryConfig;

  constructor() {
    this.configPath = path.join(os.homedir(), '.diary-cli', 'config.json');
    this.defaultConfig = {
      diariesDir: path.join(process.cwd(), 'diaries'),
      gitEnabled: false,
      gitBranch: 'main',
      autoCommit: false,
      useEmotionAsCommit: false,
      defaultCommitMessage: '📝 更新日记'
    };
  }

  /**
   * 获取配置
   */
  async getConfig(): Promise<DiaryConfig> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configData = await fs.readJson(this.configPath);
        return { ...this.defaultConfig, ...configData };
      }
      return this.defaultConfig;
    } catch (error) {
      console.warn('读取配置文件失败，使用默认配置');
      return this.defaultConfig;
    }
  }

  /**
   * 保存配置
   */
  async saveConfig(config: Partial<DiaryConfig>): Promise<void> {
    try {
      const currentConfig = await this.getConfig();
      const newConfig = { ...currentConfig, ...config };
      
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeJson(this.configPath, newConfig, { spaces: 2 });
      
      console.log('✅ 配置已保存');
    } catch (error) {
      console.error('❌ 保存配置失败:', error);
      throw error;
    }
  }

  /**
   * 重置配置
   */
  async resetConfig(): Promise<void> {
    try {
      await fs.remove(this.configPath);
      console.log('✅ 配置已重置为默认值');
    } catch (error) {
      console.error('❌ 重置配置失败:', error);
      throw error;
    }
  }

  /**
   * 显示当前配置
   */
  async showConfig(): Promise<void> {
    const config = await this.getConfig();
    console.log('\n📋 当前配置:');
    console.log(`  日记目录: ${config.diariesDir}`);
    console.log(`  Git同步: ${config.gitEnabled ? '✅ 启用' : '❌ 禁用'}`);
    if (config.gitEnabled) {
      console.log(`  Git仓库: ${config.gitRemoteUrl || '未设置'}`);
      console.log(`  Git分支: ${config.gitBranch}`);
      console.log(`  自动提交: ${config.autoCommit ? '✅ 启用' : '❌ 禁用'}`);
      console.log(`  使用情绪作为提交信息: ${config.useEmotionAsCommit ? '✅ 启用' : '❌ 禁用'}`);
      console.log(`  默认提交信息: ${config.defaultCommitMessage}`);
    }
    console.log(`  配置文件: ${this.configPath}\n`);
  }
} 