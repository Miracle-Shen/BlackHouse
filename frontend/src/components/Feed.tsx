import { useEffect, useState } from "react";
import axios from "../api/axios";
export const feedStream = () => {
  const [postAll, setPostAll] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController(); //如果组件卸载，取消请求
    const fetchDetails = async () => {
      try {
        const response = await axios.get("/details", {
          signal: controller.signal,
        });
        console.log("feed流首页", response.data);
        isMounted && setPostAll(response.data);
      }catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
    return () => { //卸载时运行，清理
      isMounted = false;
      controller.abort();
    };
    });
  return (
    <>
      <div>Detail Component</div>
      {postAll?.length ? (
        <ul>
          ok

        </ul>
      ) : (
        <p>暂无内容</p>
      )}
    </>
  );
}   