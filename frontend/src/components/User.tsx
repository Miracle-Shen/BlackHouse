import { useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import  useAxiosPrivate  from "../hooks/useAxiosPrivate";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ProfileValidation } from "@/types";
import ProfileUploader from "./common/ProfileUploader";
import { Button } from "./ui/button";
import { useUpdateUser } from "@/lib/react-query/queries";


const User = ({ users, setAuth }) => {
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const logout = async () => {
        try {
            await axiosPrivate.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setAuth({});
            //localStorage.removeItem('auth'); 
            navigate('/login', { replace: true });  // 确保退出后跳转到登录页
        }
    };
    const {mutateAsync:updateUser,isLoading: isLoadingUpdate} = useUpdateUser();
    const form = useForm<z.infer<typeof ProfileValidation>>({
        resolver: zodResolver(ProfileValidation),
        defaultValues: {
        file: [],
        },
    });
    const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
        const updatedUser = await updateUser({
            id: users.id,
            userId: users.userId,
            userName: users.userName,
            file: value.file,
            avatarUrl: users.avatarUrl,
            avatarId: users.avatarId,
        });
        setAuth({ ...users, avatarUrl: updatedUser?.avatarUrl });
        // return navigate(`/profile/${id}`);
    };

    // Set auth when users prop changes instead of during render
    useEffect(() => {
      if (users && setAuth) {
        setAuth({ ...users });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users]);

    return (
      <>
        <h1 className="text-center">我的</h1>
        {users ? (
            <div className="flex flex-col items-center gap-4">
            <section>
                <div className="flex flex-col items-center gap-4">
                    {/* <div className="avatar">
                        <img 
                            src={users.avatar || "./icons/people.svg"}  
                            alt="用户头像"
                            className="w-16 h-16 rounded-full border border-gray-300"
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleAvatarUpload}
                        />
                        <button onClick={() => fileInputRef.current.click()}>
                            上传头像
                        </button>
                    </div> */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(handleUpdate)}
                            className="flex flex-col gap-7 w-full mt-4 max-w-5xl">
                            <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem className="flex">
                                <FormControl>
                                    <ProfileUploader
                                    fieldChange={field.onChange}
                                    mediaUrl={users?.avatarUrl || "./icons/profile-placeholder.svg"}
                                    />
                                </FormControl>
                                <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                         />
                           <div className="flex gap-4 items-center justify-end">
                            {/* <Button
                                type="button"
                                className="shad-button_dark_4"
                                onClick={() => navigate(-1)}>
                                Cancel
                            </Button> */}
                            <Button
                                type="submit"
                                className="shad-button_primary whitespace-nowrap"
                                >
                                Update Profile
                            </Button>
                            </div>
                        </form>
                       
                    </Form>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">{users.userName}</h3>
                        <p className="text-sm text-gray-600">兴趣：{users.interestTags}</p>
                    </div>
                </div>
            </section>
             <section>
                <div className="flex flex-col items-center gap-4">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">我的内容</h3>
                        <p className="text-sm text-gray-600">兴趣：{users.interestTags}</p>
                    </div>
                </div>
            </section>
            <div>
                <button className="text-center" onClick={logout}>退出登录</button>
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