
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PostForm from "./PostForm";
const PostEditor = () => {
    const [title,setTitle]=useState("");
    const [content,setContent]=useState("");
    const [imgUrl,setImgUrl]=useState("");  
    const navigate = useNavigate();
    const {user} = useAuth();

    const handleAdd = async () => {
        // 发布文章的逻辑
        const postData = {
            title,
            content,
            imgUrl,
            userId: user?.id,
        };
        console.log("发布文章:", postData);
        // 这里可以调用后端API发布文章

    }
    return (
        <>
          <div onClick={() => navigate(-1)} className="cursor-pointer text-blue-600 mb-4">返回</div>
            <div className="flex flex-1">
                <div className="common-container bg-primary-50">
                    <div className="max-w-5xl flex-start">
                        <img
                            src={"../src/assets/react.svg"}
                            alt="add"
                            width={36}
                            height={36}
                        ></img>
                        <h2 className="h3-bold md:h2-bold text-left">添加短图文</h2>
                    </div>

                <PostForm />
                </div>
           </div>
        </>
    );
}


export default PostEditor;