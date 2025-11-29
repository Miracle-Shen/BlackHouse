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
  showUser = true,
  showStats = true,
}: GridPostListProps) => {
    const {auth:user} = useContext(AuthContext);

  return (
    <ul className="grid-container">
      {posts.map((post) => (
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
      ))}
    </ul>
  );
};

export default GridPostList;
