import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import type { GetServerSideProps } from 'next';
import { Button } from '@/components/ui/button';
import SearchForm from '@/components/SearchForm';
import ResultCard from '@/components/ResultCard';
import EpisodeModal from '@/components/EpisodeModal';
import VideoPlayer from '@/components/VideoPlayer';
import { HomeProps, SearchResult } from '@/types';

const Home: React.FC<HomeProps> = ({ siteConfig }) => {
  const [isBlurred, setIsBlurred] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isStatusVisible, setIsStatusVisible] = useState(false);
  const [tabs, setTabs] = useState<Array<{ name: string; results: SearchResult[] }>>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [episodesModalVisible, setEpisodesModalVisible] = useState(false);
  const [selectedItemForEpisodes, setSelectedItemForEpisodes] = useState<SearchResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // 设置背景图片URL
  const backgroundImageUrl =
    typeof window !== 'undefined'
      ? window.innerWidth <= 768
        ? siteConfig.phone_background_image_url
        : siteConfig.pc_background_image_url
      : siteConfig.pc_background_image_url;

  // Helper function to get video resolution
  const getVideoResolution = async (url: string): Promise<string> => {
    const lowerCaseUrl = url.toLowerCase();
    if (lowerCaseUrl.endsWith('.m3u8')) {
      try {
        const response = await fetch(url);
        if (!response.ok) return '未知';
        const manifest = await response.text();
        const lines = manifest.split('\n');
        let bestResolution = { width: 0, height: 0 };
        for (const line of lines) {
          if (line.includes('RESOLUTION=')) {
            const match = line.match(/RESOLUTION=(\d+)x(\d+)/);
            if (match) {
              const width = parseInt(match[1], 10);
              const height = parseInt(match[2], 10);
              if (width * height > bestResolution.width * bestResolution.height) {
                bestResolution = { width, height };
              }
            }
          }
        }
        return bestResolution.width > 0 ? `${bestResolution.height}P` : '未知';
      } catch (error) {
        console.error('Failed to parse M3U8 for resolution:', url, error);
        return '获取失败';
      }
    } else if (lowerCaseUrl.endsWith('.mp4')) {
      return new Promise(resolve => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          resolve(`${video.videoHeight}P`);
          video.remove();
        };
        video.onerror = () => {
          resolve('获取失败');
          video.remove();
        };
        video.src = url;
      });
    } else {
      return '不支持';
    }
  };

  const startSearch = (keyword: string) => {
    if (eventSource) {
      eventSource.close();
    }

    // Always start with an aggregated tab
    setTabs([{ name: '聚合', results: [] }]);
    setActiveTab(0);

    setStatusMessage('🔍 正在努力搜索中，请稍候...');
    setIsStatusVisible(true);

    // 使用新的API路由
    const url = `/api/search?keyword=${encodeURIComponent(keyword)}`;
    const newEventSource = new EventSource(url);
    setIsBlurred(true);
    setEventSource(newEventSource);

    newEventSource.onmessage = async event => {
      const sourceData = JSON.parse(event.data);
      if (!sourceData || !sourceData.result || sourceData.result.length === 0) {
        return;
      }

      // Add source name to each item for the aggregated view
      const processedResults = await Promise.all(
        sourceData.result.map(async (item: SearchResult) => {
          item.source_name = sourceData.name; // Keep track of original source
          item.resolution = '加载中...';
          if (item.videos && item.videos.length > 0) {
            item.resolution = await getVideoResolution(item.videos[0].video_url);
          } else {
            item.resolution = '无视频源';
          }
          return item;
        })
      );

      // Update state with new results
      setTabs(prevTabs => {
        // Add results to the aggregated tab (index 0)
        const updatedTabs = [...prevTabs];
        updatedTabs[0] = {
          ...updatedTabs[0],
          results: [...updatedTabs[0].results, ...processedResults],
        };

        // Add results to their own source-specific tab
        updatedTabs.push({
          name: sourceData.name,
          results: processedResults,
        });

        return updatedTabs;
      });
    };

    newEventSource.onerror = () => {
      setStatusMessage('搜索完成');
      setTimeout(() => {
        setIsStatusVisible(false);
      }, 2000);
      newEventSource.close();
    };
  };

  const showEpisodes = (item: SearchResult) => {
    if (!item.videos || item.videos.length === 0) {
      setStatusMessage('该项目没有可播放的视频源');
      setIsStatusVisible(true);
      setTimeout(() => {
        setIsStatusVisible(false);
      }, 2000);
      return;
    }
    setSelectedItemForEpisodes(item);
    setEpisodesModalVisible(true);
  };

  const closeEpisodesModal = () => {
    setEpisodesModalVisible(false);
  };

  const playVideo = (url: string, title: string) => {
    closeEpisodesModal(); // Close episode selector before playing

    const lowerCaseUrl = url.toLowerCase();
    if (!lowerCaseUrl.endsWith('.m3u8') && !lowerCaseUrl.endsWith('.mp4')) {
      window.open(url, '_blank');
      return;
    }

    setVideoUrl(url);
    setVideoTitle(title);
    setModalVisible(true);
  };

  const closeVideoModal = () => {
    setModalVisible(false);
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) closeBtn.style.display = 'none';
  };

  useEffect(() => {
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [eventSource]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <style>{`
          body {
            background-image: url('${backgroundImageUrl}');
          }
        `}</style>
      </Head>

      {/* <div className={isBlurred ? 'blurred-bg' : ''}></div> */}

      <SearchForm onSearch={startSearch} />

      {isStatusVisible && (
        <div
          id="status"
          className="fixed top-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg z-50 text-lg font-medium whitespace-nowrap"
        >
          {statusMessage}
        </div>
      )}

      {tabs.length > 1 && (
        <div className="tabs-nav mb-5 overflow-x-auto pb-2">
          <div className="tabs-container flex">
            {tabs.map((tab, index) => (
              <Button
                key={tab.name}
                onClick={() => setActiveTab(index)}
                variant={activeTab === index ? 'default' : 'outline'}
                className="mr-2 mb-2 whitespace-nowrap"
              >
                {tab.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {tabs.map((tab, index) => (
        <div key={tab.name} style={{ display: activeTab === index ? 'block' : 'none' }}>
          <div className="results-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mt-5">
            {tab.results.map(item => (
              <ResultCard
                key={`${item.name}-${item.source_name}`}
                item={item}
                onClick={showEpisodes}
              />
            ))}
          </div>
        </div>
      ))}

      <EpisodeModal
        isVisible={episodesModalVisible}
        selectedItem={selectedItemForEpisodes}
        onClose={closeEpisodesModal}
        onPlay={playVideo}
      />

      <VideoPlayer
        url={videoUrl}
        title={videoTitle}
        isVisible={modalVisible}
        onClose={closeVideoModal}
      />
    </div>
  );
};

// 获取站点配置
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // 使用新的API路由获取配置
    const response = await fetch('http://localhost:3001/api/config');
    const siteConfig = await response.json();

    return {
      props: {
        siteConfig,
      },
    };
  } catch (error) {
    console.error('Failed to fetch site config:', error);
    return {
      props: {
        siteConfig: {},
      },
    };
  }
};

export default Home;
