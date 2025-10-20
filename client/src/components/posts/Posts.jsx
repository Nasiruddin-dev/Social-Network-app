import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../axios";

const Posts = ({userid}) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts", userid],
    queryFn: () => {
      const url = userid ? `/posts?userid=${userid}` : "/posts";
  return axiosInstance.get(url).then((res) => {
        return res.data;
      });
    }
  });
  return (
    <div className="posts">
      {error
        ? "Something went wrong!"
        : isLoading
        ? "loading"
        : data.map((post) => <Post post={post} key={post.id} />)}
    </div>
  );
};

export default Posts;
