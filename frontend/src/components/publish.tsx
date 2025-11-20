// src/components/PostEditor.tsx
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // 富文本编辑器样式
import { useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';

// 定义富文本编辑器的工具栏配置
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['link', 'image'],
    ['clean']
  ]
};

// 格式配置
const formats = [
  'header', 'font', 'list', 'bullet', 'bold', 'italic',
  'underline', 'strike', 'blockquote', 'color', 'background',
  'align', 'link', 'image'
];

const PostEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 简单验证
    if (!title.trim() || !content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // 提交到后端
      await axiosPrivate.post('/posts', {
        title,
        content,
        createdAt: new Date().toISOString()
      });
      
      // 提交成功后返回首页
      navigate('/');
    } catch (err) {
      console.error('发布失败:', err);
      setError('发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div onClick={() => navigate(-1)} className="cursor-pointer text-blue-600 mb-4">返回</div>
      <h1 className="text-2xl font-bold mb-6">创建新帖子</h1>
      
      {error && (
        <div className="errmsg mb-4">{error}</div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题输入 */}
        <div>
          <label htmlFor="title" className="block text-lg mb-2">
            标题
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="请输入帖子标题"
          />
        </div>
        
        {/* 富文本编辑器 */}
        <div>
          <label htmlFor="content" className="block text-lg mb-2">
            内容
          </label>
          <ReactQuill
            id="content"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="请输入帖子内容..."
            className="min-h-[300px] border border-gray-300 rounded-md"
          />
        </div>
        
        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? '发布中...' : '发布帖子'}
        </button>
      </form>
    </div>
  );
};

export default PostEditor;