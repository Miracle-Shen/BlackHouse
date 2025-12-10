import * as z from "zod";
import { useEffect, useRef } from "react";
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
import { PostValidation } from "@/types/index";
import { lazy, Suspense } from "react";
const FileUploader = lazy(() => import("./common/FileUploader"));
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import type { INewPost, IUpdatePost } from "@/types";
import { useGlobalModal } from "@/context/ModalProvider";
import {usePostDraft} from '../hooks/useDraft';
type PostFormProps = {
  post?: INewPost;
  action: "Create" | "Update";
  userId?: string;
  tags?: string[];
  creatorId: string;
  aiCaption?: string;
  draftKey?: string; onAutoSave?: (timestamp: number) => void;
};

const PostForm = ({ post, action, creatorId, aiCaption,tags,draftKey,onAutoSave }: PostFormProps) => {
  const { showConfirm } = useGlobalModal();
  const navigate = useNavigate();


  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      title: post?.title || "",
      file: [],
      tags: tags || post?.tags || [], 
      $id: post?.$id || "",
    },
  });


  const { clearDraft, autoSavedAt } = usePostDraft(draftKey, form);
  useEffect(() => {
    if (!autoSavedAt) return;   // 初始 null 不触发
    if (onAutoSave) onAutoSave(autoSavedAt);
  }, [autoSavedAt, onAutoSave]);
  const captionRef = useRef<HTMLTextAreaElement | null>(null);
  const hasScrolledByAIRef = useRef(false);
  
  useEffect(() => {
    if (typeof aiCaption === "string") {
      form.setValue("caption", aiCaption, {
        shouldDirty: true,
        shouldValidate: true,
      });

      if (aiCaption && !hasScrolledByAIRef.current) {
        hasScrolledByAIRef.current = true;
        captionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        captionRef.current?.focus();
      }
    } else {
      hasScrolledByAIRef.current = false;
    }
  }, [aiCaption, form]);

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
          tags: value.tags || [],
        };
        const updatedPost = await updatePost(updateData);
        if (!updatedPost) {
          return;
        }
        clearDraft();// 提交成功后清除草稿

        showConfirm({
          title: "帖子更新成功！",
          description: "你的帖子已成功更新。",
          confirmText: "去查看",
          onConfirm: () => {
            navigate(`/posts/${updatedPost.$id}`);
          },
        });
        return;
      }

      const newPostData: INewPost = {
        ...value,
        $id: "", //占位
        imageId: "",
        imageUrl: "",
        creator: creatorId,
        tags: value.tags || [],
      };
      const newPost = await createPost(newPostData);
      if (!newPost) {
        return;
      }
      clearDraft();//
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
    }
  };

  const isSubmitting =
    isLoadingCreate || (isLoadingUpdate && post?.imageUrl === undefined);

  return (
    <>
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex w-full flex-col gap-5"
      >
        {/* 标题 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            标题
          </p>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="shad-textarea h-11 text-sm text-slate-900"
                    rows={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* 正文 */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">正文内容</p>
          <FormField
            control={form.control}
            name="caption"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="shad-textarea h-[28em] text-sm leading-relaxed text-slate-900"
                    {...field}
                    ref={captionRef}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
        </div>

          {/* 标签（可选） */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-500">
            标签（可选）
          </p>
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="shad-textarea h-8 text-sm leading-relaxed text-slate-900"
                    value={field.value?.join(", ") ?? ""}   // 将数组显示为字符串
                    onChange={(e) => {
                      const raw = e.target.value;
                      const tags = raw
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean); // 过滤空字符串
                      field.onChange(tags);
                    }}
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-500" />
              </FormItem>
            )}
          />
          <p className="text-[11px] text-slate-400">
            可以不填；若填写，请用逗号分隔多个标签。
          </p>
        </div>

        {/* 图片上传块 */}
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4">
          <p className="mb-2 text-xs font-medium text-slate-500">
            封面图片
          </p>
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Suspense fallback={<div>Loading...</div>}>
                    <FileUploader
                      fieldChange={field.onChange}
                      mediaUrl={post?.imageUrl || ""}
                    />
                  </Suspense>
                </FormControl>
                <FormMessage className="mt-1 text-xs text-red-500" />
              </FormItem>
            )}
          />
          <p className="mt-2 text-[11px] text-slate-400">
            建议上传清晰、干净的竖图或方图，能更好地展示在列表中。
          </p>
        </div>

        {/* 底部按钮*/}
        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-9 w-full rounded-full border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 sm:w-28"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative h-9 w-full rounded-full bg-blue-500 text-sm font-medium text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-70 hover:bg-blue-600 sm:w-28"
          >
            <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
              提交
            </span>
            {isSubmitting && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Loader />
              </span>
            )}
          </button>
        </div>
      </form>
    </Form>
    </>
  );
};

export default PostForm;
