import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PostService from '@services/postService';
// import { useAuth } from '@context/AuthContext';

import './Posts.css';
import '@styles/App.css';
import { useCookies } from 'react-cookie';


const PostViewing = () => {

    useEffect(() => {
        document.title = "Post";
    }, []);

    const params = useParams();
    const [ cookies ] = useCookies(["token"]);

    const [ post, setPost ] = useState(null);
    const [ postLoaded, setPostLoaded ] = useState(false);

    // const { user } = useAuth();

    useEffect(() => {
        const service = new PostService(cookies.token);

        const fetchPost = async (postId) => {
            try {
                const post = await service.getPost(postId);

                setPost(post);
                setPostLoaded(true);
    
            } catch (err) {
                console.error(err);
            }
        }

        fetchPost(params.postId);
        
    }, [cookies.token, params.postId]);

    return (
        <main>
            <div>
                {postLoaded ? 
                    <div>
                        {post &&
                            <div>
                                <span>{post.user.firstName} {post.user.lastName}</span><br />
                                <span>{new Date(post.timestamp).toLocaleString()}</span><br />
                                <span>{post.text}</span>
                            </div>
                        }
                    </div> :
                    <span className='loader' />
                }
            </div>
        </main>
    );
}


export default PostViewing;
