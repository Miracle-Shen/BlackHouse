import React, { Suspense } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/Form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileValidation } from "@/types";
//lazy load ProfileUploader
import { lazy } from "react";
const ProfileUploader = lazy(() => import("./ProfileUploader"));
import { Button } from "../ui/button";
import { useUpdateUser } from "@/lib/react-query/queries";
import Loader from "./Loader";

type UpdateAvatarModalProps = {
  users: any;
  setUsers: (u: any) => void;   
  onClose: () => void;
};

const UpdateAvatarModal: React.FC<UpdateAvatarModalProps> = ({ users, setUsers ,onClose }) => {
  const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUser();

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
    },
  });

  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    const updatedUser = await updateUser({
      $id: users?.$id,
      userId: users?.userId,
      userName: users.userName,
      file: value?.file,
      avatarUrl: users?.avatarUrl,
      avatarId: users?.avatarId,
    });
    setUsers({ ...users, avatarUrl: updatedUser?.avatarUrl });
    onClose(); // 提交后关闭弹窗
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      {/* 弹窗主体 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">修改头像</h3>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdate)}
              className="flex flex-col gap-6"
            >
              <FormField
                control={form.control}
                name="file"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center gap-2">
                    <FormControl>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ProfileUploader
                          fieldChange={field.onChange}
                          mediaUrl={users?.avatarUrl || "./icons/profile-placeholder.svg"}
                        />
                      </Suspense>
                    </FormControl>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />
              
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap px-6 py-2 rounded-lg"
                disabled={isLoadingUpdate}
              >
                {isLoadingUpdate && <Loader />}
                提交
              </Button>

              <Button
                type="button"
                className="shad-button_secondary whitespace-nowrap px-6 py-2 rounded-lg mt-4"
                onClick={() => { onClose() }}>
                取消
              </Button>
            </form>
          </Form>

        </div>
      </div>
    </>

  );
};

export default UpdateAvatarModal;