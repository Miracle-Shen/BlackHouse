import * as z from "zod"; // 导入 zod 库，用于定义和验证表单数据的模式
import type { Models } from 'appwrite';
import { useForm } from "react-hook-form"; // 导入 react-hook-form，用于管理表单状态
import { useNavigate } from "react-router-dom"; // 导入 useNavigate，用于页面导航
import { zodResolver } from "@hookform/resolvers/zod"; // 可选：用于将 zod 与 react-hook-form 集成
import  Loader  from "./common/Loader"; // 可选：导入加载器组件
import {
  Form, // 表单组件
  FormControl, // 表单控件包装器
  FormField, // 表单字段组件
  FormItem, // 表单项组件
  FormMessage, // 表单消息组件（如错误提示）
} from "./ui/Form"; // 从自定义 UI 组件库中导入表单相关组件
import { Textarea } from "./ui/textarea"; // 导入自定义的文本区域组件
import FileUploader from "./common/FileUploader";
import { PostValidation } from "@/types/index"; // 可选：导入表单验证规则
// import { useUserContext } from "@/context/AuthContext"; // 可选：导入用户上下文，用于获取当前用户信息
// import { FileUploader, Loader } from "@/components/shared"; // 可选：导入文件上传器和加载器组件
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries"; // 可选：导入创建和更新 post 的自定义查询
import { useToast } from "@/hooks/use-toast"
import { useState } from "react";
type PostFormProps = {
  post?: Models.Document; // 可选的 post 数据，用于编辑模式
  action: "Create" | "Update"; // 表单操作类型：创建或更新
  userId: string;
  creatorId:string;
};

const PostForm = ({ post, action,userId, creatorId }: PostFormProps) => {
  const navigate = useNavigate(); // 初始化导航函数
  const [currentImageUrl, setCurrentImageUrl] = useState(post?.imageUrl || "");

  const { toast } = useToast();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation), // 使用 zod 验证规则解析器
    defaultValues: {
      caption: post ? post?.caption : "", // 如果是编辑模式，设置默认值为 post 的 caption
      title: post ? post?.title : "", // 如果是编辑模式，设置默认值为 post 的 title
      file: [], // 默认文件列表为空
      tags: post ? post?.tags  : "", // 如果是编辑模式，设置默认值为 post 的 tags
      userId: userId, // 设置当前用户 ID
    },
  });
  // Query
  const { mutateAsync: createPost, isLoading: isLoadingCreate } = useCreatePost(); // 创建 post 的异步函数
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost(); // 更新 post 的异步函数

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    // ACTION = UPDATE
    if (post && action === "Update") {
      const updatedPost = await updatePost({
        ...value, // 合并表单数据
        postId: post.$id, // 设置要更新的 post ID
        imageId: post.imageId, // 设置要更新的图片 ID
        imageUrl: post.imageUrl, // 设置要更新的图片 URL
      });

      if (!updatedPost) {
        toast({
          title: `${action} post failed. Please try again.`, // 显示错误消息
        });
      }
      console.log("going to",post.$id);
      return navigate(`/posts/${post.$id}`); // 更新成功后跳转到 post 的详情页
    }

    // ACTION = CREATE
    const newPost = await createPost({
      ...value, 
      creator:creatorId, 
    });
 


    if (!newPost) {
      toast({
        title: `${action} post failed. Please try again.`, // 显示错误消息
      });
    }
    // navigate("/"); // 创建成功后跳转到首页
    console.log("going to",newPost.$id);
    return navigate(`/posts/${newPost.$id}`); // 更新成功后跳转到 post 的详情页
  };
  
  return (
    <Form {...form}> {/* 表单组件，传入表单实例 */}
      <form
        onSubmit={form.handleSubmit(handleSubmit)} // 提交表单时调用 handleSubmit
        className="flex flex-col gap-9 w-full  max-w-5xl">
          <p>输入标题</p>
          <FormField
            control={form.control} // 绑定表单控制器
            name="title" // 字段名称
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="shad-textarea custom-scrollbar" // 文本区域样式
                    {...field} // 绑定字段
                  />
                </FormControl>
                <FormMessage className="shad-form_message" /> {/* 显示验证消息 */}
              </FormItem>
            )}
          />
          <p>输入内容</p>
        <FormField
          control={form.control} // 绑定表单控制器
          name="caption" // 字段名称
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar" // 文本区域样式
                  {...field} // 绑定字段
                />
              </FormControl>
              <FormMessage className="shad-form_message" /> {/* 显示验证消息 */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control} // 绑定表单控制器
          name="file" // 字段名称
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange} // 文件上传时触发字段更新
                  mediaUrl={currentImageUrl} // 如果是编辑模式，显示已有图片
                />
              </FormControl>
              <FormMessage className="shad-form_message" /> {/* 显示验证消息 */}
            </FormItem>
          )}
        />


        <div className="flex gap-4 items-center justify-end"> {/* 按钮容器样式 */}
          <button
            type="button" // 按钮类型
            className="shad-button_dark_4" // 按钮样式
            onClick={() => navigate(-1)}> {/* 点击返回上一页 */}
            取消
          </button>
          <button
            type="submit" 
            className="shad-button_primary whitespace-nowrap" 
            disabled={isLoadingCreate || isLoadingUpdate}> 
            {(isLoadingCreate || isLoadingUpdate) && <Loader />} 
            {action} Post
          </button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm; // 导出组件