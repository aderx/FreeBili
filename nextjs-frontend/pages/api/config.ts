import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// 定义数据结构
interface BaseUrlItem {
  name: string;
  base_url: string;
}

interface SiteConfig {
  site_name: string;
  pc_background_image_url: string;
  phone_background_image_url: string;
  timeout: number;
  base_urls: BaseUrlItem[];
}

// 读取配置文件
export function getConfig(): SiteConfig {
  const configPath = path.join(process.cwd(), 'config.json');
  const rawData = fs.readFileSync(configPath, 'utf-8');
  return JSON.parse(rawData);
}

// 更新配置文件
export function updateConfig(newConfig: SiteConfig): void {
  const configPath = path.join(process.cwd(), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 4), 'utf-8');
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 设置CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      const config = getConfig();
      res.status(200).json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read config file' });
    }
  } else if (req.method === 'POST') {
    try {
      const newConfig = req.body as SiteConfig;
      updateConfig(newConfig);
      res.status(200).json({ 
        message: 'Configuration updated and saved successfully.',
        current_config: newConfig
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update config file' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}