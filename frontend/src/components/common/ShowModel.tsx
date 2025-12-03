interface TimeoutModalProps {
  onNavigate: (toLogin: boolean) => void;
}

const ShowModel: React.FC<TimeoutModalProps> = ({ onNavigate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">会话已超时</h3>
          <p className="text-gray-500 mt-2">该功能需要登录！登录状态已过期，请重新登录或返回首页</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            返回首页
          </button>
          <button
            onClick={() => onNavigate(true)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            去登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowModel;