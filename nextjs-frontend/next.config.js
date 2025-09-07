/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // 配置Next.js处理静态资源
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  // 允许从远程域名加载图片
  images: {
    domains: ['img.qlqqs.com', 'www.loliapi.com'],
  },
}

module.exports = nextConfig