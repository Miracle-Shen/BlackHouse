import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import AuthContext from "../context/AuthProvider";
import  useAxiosPrivate  from "../hooks/useAxiosPrivate";
const User = ({users}) => {
    // const[users,setUsers]=useState([]);
    const [isStorage,setIsStorage]=useState(false);
    const navigate=useNavigate();
    const {setAuth}=useContext(AuthContext);
    const axiosPrivate = useAxiosPrivate();
    const fileInputRef = useRef(null); // Reference for file input


    const logout = async () => {
        try {
            // 调用后端退出登录接口
            await axiosPrivate.post('/logout');
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setAuth({});
            //localStorage.removeItem('auth'); 
            //navigate('/login', { replace: true });  // 确保退出后跳转到登录页
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axiosPrivate.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            const avatarURL =  `https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/${response.data.$id}/view?project=691ec46d0011cc0af217&mode=admin`;
                                //https://nyc.cloud.appwrite.io/v1/storage/buckets/69230b780026a1648b96/files/69242d6d001192d4e231/view?project=691ec46d0011cc0af217&mode=admin
            setUsers(prevUsers => ({
                ...prevUsers,
                avatar: avatarURL
            }));
          
        } catch (err) {
            console.error("Avatar upload failed:", err);
        }
    };
    // useEffect(() => {
    //     if (users) {
    //         localStorage.setItem("user", JSON.stringify(users));
    //     }
    // }, [users]);

    // useEffect(() => {
    //     const cachedUser = localStorage.getItem('user');
    //     if (cachedUser) {
    //         setUsers(JSON.parse(cachedUser));
    //         setIsStorage(true);
    //     }

    //     let isMounted = true;
    //     const controller = new AbortController();

    //     const fetchUsers = async () => {
    //         try {
    //             const response = await axiosPrivate.get('/user', {
    //                 signal: controller.signal,
    //             });
    //             if (isMounted) {
    //                 setUsers(response.data);
    //                 localStorage.setItem('user', JSON.stringify(response.data));
    //             }
    //         } catch (err) {
    //             console.error(err);
    //         }
    //     };

    //     if (!cachedUser) {
    //         fetchUsers();
    //     }

    //     return () => {
    //         isMounted = false;
    //         controller.abort();
    //     };
    // }, []);

    return (
      <>
        <h1 className="text-center">我的</h1>
        {users ? (
            <div className="flex flex-col items-center gap-4">
            <section>
                <div className="flex flex-col items-center gap-4">
                    <div className="avatar">
                        <img 
                            src={users.avatar ||  fileInputRef.current}  
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
                    </div>
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