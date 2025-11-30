import * as z from "zod";
import type { Models } from 'appwrite';
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

type PostFormProps = {
  post?: Models.Document;
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
      userId: userId,
    },
  });

  const { mutateAsync: createPost, isLoading: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } = useUpdatePost();

  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    try {
      if (post && action === "Update") {
        const updatedPost = await updatePost({
          ...value,
          postId: post.$id,
          imageId: post.imageId,
          imageUrl: post.imageUrl,
        });

        if (!updatedPost) {
          toast({ title: `${action} post failed. Please try again.` });
          return;
        }
        return navigate(`/posts/${post.$id}`);
      }

      const newPost = await createPost({
        ...value,
        creator: creatorId,
      });

      if (!newPost) {
        toast({ title: `${action} post failed. Please try again.` });
        return;
      }
      return navigate(`/posts/${newPost.$id}`);
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