const MinePage = () => {
  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-center text-gray-800">我的</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-4">
          <img 
            src="https://via.placeholder.com/60x60"
            alt="用户头像"
            className="w-15 h-15 rounded-full"
          />
          <div>
            <h3 className="font-medium text-gray-900">用户名称</h3>
            <p className="text-sm text-gray-500">个人简介</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-700">我的收藏</span>
            <span className="text-gray-400">→</span>
          </div>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span className="text-gray-700">设置</span>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MinePage