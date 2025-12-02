import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import  useAxiosPrivate  from "../hooks/useAxiosPrivate";
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
import ProfileUploader from "./common/ProfileUploader";
import { Button } from "./ui/button";
import { useGetUserPosts, useUpdateUser } from "@/lib/react-query/queries";
import GridPostList from "./common/GridPostList";
import Loader from "./common/Loader";
type UserProps = {
  users: any; // 建议替换为具体用户类型
  setAuth: (auth: any) => void; // 明确 setAuth 类型
};
const User = ({ users, setAuth }: UserProps) => {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const logout = async () => {
        try {
            await axiosPrivate.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setAuth({});
            localStorage.removeItem('user'); 
            navigate('/login', { replace: true });  // 确保退出后跳转到登录页
        }
    };
    const {mutateAsync:updateUser,isPending: isLoadingUpdate} = useUpdateUser();
    const form = useForm<z.infer<typeof ProfileValidation>>({
        resolver: zodResolver(ProfileValidation),
        defaultValues: {
        file: [],
        },
    });
    const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
        const updatedUser = await updateUser({
            $id: users?.id,
            userId: users?.userId,
            userName: users.userName,
            file: value?.file,
            avatarUrl: users?.avatarUrl,
            avatarId: users?.avatarId,
        });
        setAuth({ ...users, avatarUrl: updatedUser?.avatarUrl });
    };
    useEffect(() => {
      if (users && setAuth) {
        setAuth({ ...users });   
      }
    }, [users]);
 
    const { data: userPosts } = useGetUserPosts(
        users.id
    );

    return (
      <>
        {users ? (
            <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
              <section className="w-full">
                <div className="flex flex-col items-center gap-6">
                  <div className="flex justify-center w-full">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleUpdate)}
                        className="flex flex-col gap-6 w-full max-w-md mx-auto mt-4"
                      >
                        <FormField
                          control={form.control}
                          name="file"
                          render={({ field }) => (
                            <FormItem className="flex flex-col items-center gap-2">
                              <FormControl>
                                <ProfileUploader
                                  fieldChange={field.onChange}
                                  mediaUrl={users?.avatarUrl || './icons/profile-placeholder.svg'}
                                />
                              </FormControl>
                              <FormMessage className="shad-form_message" />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-4 items-center justify-center">
                          <Button
                            type="submit"
                            className="shad-button_primary whitespace-nowrap px-6 py-2 rounded-lg"
                           disabled={isLoadingUpdate}>
                            {isLoadingUpdate && <Loader />}
                            提交新头像
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                  <div className="text-center w-full">
                    <h3 className="text-xl font-bold mb-1">{users.userName}</h3>
                    <p className="text-base text-gray-600">兴趣：{users.interestTags}</p>
                  </div>
                </div>
              </section>
              <section className="w-full">
                <div className="flex flex-col items-center gap-4 bg-gray-50 rounded-lg p-4">
                  <div className="text-center w-full">
                    <h3 className="text-lg font-semibold mb-2">我的帖子</h3>
                    <GridPostList posts={userPosts?.documents || []} />
                  </div>
                </div>
              </section>
              <div className="w-full flex justify-center mt-4">
                <button className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition" onClick={logout}>退出登录</button>
              </div>
            </div>
        )
        :
        (<Link to="/">返回登录页</Link>
        )}
      </>
    )
}

export default User;