import * as z from "zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import Loader from "./common/Loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "./ui/Form";
import { Textarea } from "./ui/Textarea";
import FileUploader from "./common/FileUploader";
import { PostValidation } from "@/types/index";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { useToast } from "@/hooks/use-toast";
import type {INewPost, IUpdatePost} from '@/types'
import { useGlobalModal } from "@/context/ModalProvider";
type PostFormProps = {
  post?:INewPost;
  action: "Create" | "Update";
  userId?: string;
  creatorId: string;
};

const PostForm = ({ post, action, creatorId }: PostFormProps) => {
  const { showConfirm} = useGlobalModal()
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      title: post?.title || "",
      file: [],
      tags: [],
      $id: post?.$id || "",
    },
  });

  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    try {
      if (post && action === "Update") {
        const updateData: IUpdatePost = {
          ...value,
          $id: post.$id!,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
          tags: [],
        };
        const updatedPost = await updatePost(updateData);
        if (!updatedPost) {
          toast({ title: `${action} post failed. Please try again.` });
          return;
        }
        showConfirm({
          title: "帖子更新成功！",
          description: "你的帖子已成功更新。",  
          confirmText: "去查看",      
          onConfirm: () => {
            navigate(`/posts/${updatedPost.$id}`);
          },
        }); 
      }

      const newPostData: INewPost = {
        ...value,
        creator: creatorId,
        tags: [],
      };
      const newPost = await createPost(newPostData);
      if (!newPost) {
        toast({ title: `${action} post failed. Please try again.` });
        return;
      }
       showConfirm({
          title: "帖子创建成功！",
          description: "你的帖子已成功创建。",  
          confirmText: "去查看",      
          onConfirm: () => {
            navigate(`/posts/${newPost.$id}`);
          },
        }); 
    } catch (error) {
      console.error("Error submitting post:", error);
      toast({ title: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4 w-full max-w-5xl"
      >
        <p>输入标题</p>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="shad-textarea h-12"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <p>输入内容</p>
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="shad-textarea h-52"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <div className="shad-textarea px-4 py-4 shadow-sm rounded-lg ">
        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl || ""}
                />
              </FormControl>
               <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        </div>
        <div className="flex gap-4 items-center justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isLoadingCreate || isLoadingUpdate && post?.imageUrl===undefined}
            className="relative"
          >
            提交
            {(isLoadingCreate || isLoadingUpdate) && (
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader />
              </span>
            )}
          </button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;