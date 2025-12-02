import { Link } from "react-router-dom";

type GridPostListProps = {
  posts: Array<{
    $id: string;
    title?: string;
    imageUrl?: string;
  }>;
  showUser?: boolean;
  showStats?: boolean;
};

const GridPostList = ({ posts }: GridPostListProps) => {
  return (
    <div className="bg-dark-2 rounded-3xl border border-dark-4 p-5 lg:p-7 w-full max-w-screen-sm">
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {posts.map((post) => (
            <div key={post.$id} className="relative">
              <Link to={`/posts/${post.$id}`} className="block rounded-[24px] border border-dark-4 overflow-hidden cursor-pointer">
                <img
                  src={post.imageUrl || "/icons/default-image.svg"}
                  alt="post"
                  className="h-40 w-full object-cover"
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary-100 to-transparent p-2">
                  <p className="text-black text-sm font-medium truncate">{post.title || "Untitled"}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">暂无内容，快去发布第一条吧～</div>
      )}
    </div>
  );
};

export default GridPostList;

