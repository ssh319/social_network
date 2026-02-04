import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
// import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import PostService from '@services/postService';
import { useAuth } from '@context/AuthContext';
import Feed from '@components/Feed';

import './Posts.css';


const HomePage = () => {

    const [ cookies ] = useCookies(["token"]);
    
    const [ feed, setFeed ] = useState([]);
    const [ feedLoaded, setFeedLoaded ] = useState(false);

    const { user } = useAuth();
    
    useEffect(() => {
        document.title = "Feed";
    }, []);
    
    useEffect(() => {
        const fetchPosts = async () => {
            const service = new PostService(cookies.token);

            try {
                const fetchedPosts = await service.getPostsFeed();

                setFeed(fetchedPosts.map((post) => {
                    post.liked = post.likes.includes(user._id);
                    return post;
                }));
                setFeedLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        fetchPosts();

    }, [cookies.token, user._id]);

    return (
        <main>
            <Feed posts={feed} isLoaded={feedLoaded} />
        </main>
    );
}


export default HomePage;
