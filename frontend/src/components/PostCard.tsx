const PostCard = ({post}) => {
  return (
    <div>
      <div className="flex flex-col justify-center items-center mb-2 w-full"> 
        <img src={post.imageUrl} alt={post.imageUrl} className="w-10 h-10 rounded-full mr-2" />
        <span className="font-semibold">{post.userName}</span>
         <h2 className="font-bold">{post.title}</h2>
        <p className="text-sm text-gray-500">{post.content}</p>
      </div>
     
    </div>
  );

}

export default PostCard;