const PublishPage = () => {
  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-center text-gray-800">发布动态</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <textarea 
          className="w-full min-h-32 p-3 border border-gray-200 rounded-lg resize-none focus:border-primary-500 focus:outline-none"
          placeholder="分享你的想法..."
        />
        
        <div className="flex justify-between items-center mt-4">
          <button className="text-gray-500 p-2 hover:bg-gray-100 rounded-lg">
            📷 添加图片
          </button>
          <button className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600">
            发布
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishPage