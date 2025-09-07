import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { getConfig } from './config';

interface Video {
  name: string;
  video_url: string;
}

interface SearchResult {
  name: string;
  vod_pic: string;
  videos: Video[];
}

interface SourceData {
  name: string;
  result: SearchResult[];
}

// 解析CMS数据
function parseCmsData(sourceName: string, cmsList: any[]): SourceData {
  const results: SearchResult[] = [];
  
  for (const item of cmsList) {
    // vod_play_url 的格式通常是 '播放源1$$$播放源2'
    // 我们只取第一个播放源
    const playUrlsStr = item.vod_play_url?.split("$$$")[0] || '';
    
    const videos: Video[] = [];
    // 视频列表以 '#' 分割
    const episodes = playUrlsStr.split('#');
    for (const episode of episodes) {
      // 每一集是 '剧集名$播放链接'
      const parts = episode.split('$');
      if (parts.length === 2) {
        const videoName = parts[0];
        const videoUrl = parts[1];
        videos.push({ name: videoName, video_url: videoUrl });
      }
    }

    // 只有当成功解析出视频时才添加该条目
    if (videos.length > 0) {
      results.push({
        name: item.vod_name || "未知名称",
        vod_pic: item.vod_pic || "",
        videos: videos
      });
    }
  }
  
  return {
    name: sourceName,
    result: results
  };
}

// 获取并处理单个API源的数据
async function fetchAndProcess(source: any, keyword: string, timeout: number, res: NextApiResponse): Promise<void> {
  const url = `${source.base_url}?ac=detail&wd=${encodeURIComponent(keyword)}`;
  const name = source.name;
  
  try {
    console.log(`开始搜索: ${name} -> ${url}`);
    
    // 设置超时
    const response = await axios.get(url, {
      timeout: timeout * 1000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    
    const data = response.data;
    
    if (data.code === 1 && data.list && data.list.length > 0) {
      console.log(`成功: ${name}`);
      const result = parseCmsData(name, data.list);
      // 通过SSE发送结果
      res.write(`data: ${JSON.stringify(result)}\n\n`);
    } else {
      console.log(`数据为空或格式错误: ${name}, message: ${data.msg}`);
    }
  } catch (error) {
    console.log(`请求或处理时发生错误: ${name}, 错误: ${error}`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { keyword } = req.query;
  
  if (!keyword || typeof keyword !== 'string') {
    res.status(400).json({ error: 'keyword is required' });
    return;
  }
  
  // 设置CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  // 设置SSE响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const config = getConfig();
  const sources = config.base_urls;
  const timeout = config.timeout;
  
  try {
    // 并行处理所有源
    const promises = sources.map(source => 
      fetchAndProcess(source, keyword, timeout, res)
    );
    
    await Promise.all(promises);
    
    // 结束响应
    res.end();
  } catch (error) {
    console.error('Search error:', error);
    res.write(`data: ${JSON.stringify({ error: '搜索过程中发生错误' })}\n\n`);
    res.end();
  }
}

// 禁用默认的body parser，以便支持流式响应
export const config = {
  api: {
    bodyParser: false,
  },
};