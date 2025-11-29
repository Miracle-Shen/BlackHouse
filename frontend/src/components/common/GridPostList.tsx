import AuthContext from "@/context/AuthProvider";
import type { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useContext } from "react";

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({
  posts,
}: GridPostListProps) => {

  return (
    <>
    <ul className="grid-container">
      {posts && posts.length > 0 ? (
        posts.map((post) => (
          <li key={post.$id} className="relative min-w-40 h-40">
            <Link to={`/posts/${post.$id}`} className="grid-post_link">
              <a>{post.title}</a>
              <img
                src={post.imageUrl}
                alt="post"
                className="h-full w-full object-cover"
              />
            </Link>
          </li>
        ))
      ) : (
        <>暂无内容，快去发布第一条吧～</>
      )}
    </ul>
    </>
  );
};

export default GridPostList;

