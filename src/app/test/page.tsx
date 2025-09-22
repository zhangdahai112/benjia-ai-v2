export default function TestPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🏮 香港解梦游戏APP</h1>
        <p className="text-xl text-gray-600 mb-6">应用正在正常运行！</p>
        <div className="text-lg">
          <p>✅ Next.js 构建成功</p>
          <p>✅ 路由配置正确</p>
          <p>✅ 样式渲染正常</p>
        </div>
        <div className="mt-8">
          <a href="/" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            返回主页
          </a>
        </div>
      </div>
    </div>
  );
}
