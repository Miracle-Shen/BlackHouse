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

type PostFormProps = {
  post?:INewPost;
  action: "Create" | "Update";
  userId: string;
  creatorId: string;
};

const PostForm = ({ post, action, userId, creatorId }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      title: post?.title || "",
      file: [],
      tags: post?.tags || "",
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
          $id: post.$id,
          creator: post.creator,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        };
        const updatedPost = await updatePost(updateData);
        if (!updatedPost) {
          toast({ title: `${action} post failed. Please try again.` });
          return;
        }
        return navigate(`/posts/${post.$id}`);
      }

      const newPostData: INewPost = {
        ...value,
        creator: creatorId,
      };
      const newPost = await createPost(newPostData);
      if (!newPost) {
        toast({ title: `${action} post failed. Please try again.` });
        return;
      }
      return navigate(`/posts/${newPost.id}`);
    } catch (error) {
      console.error("Error submitting post:", error);
      toast({ title: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full max-w-5xl"
      >
        <p>输入标题</p>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
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
                  className="shad-textarea custom-scrollbar"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

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
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
          <button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {(isLoadingCreate || isLoadingUpdate) && <Loader />} 
            {action} Post
          </button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;