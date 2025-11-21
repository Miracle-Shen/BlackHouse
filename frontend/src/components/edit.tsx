
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
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
            <section className="flex flex-col gap-4 p-4">
                图片选择区
            </section>
            <section className="flex flex-col gap-4 p-4">
                文章编辑区
            </section>


            <button className="flex justify-center p-4">
                发布按钮区
            </button>
        </>
    );
}


export default PostEditor;