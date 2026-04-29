import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import ImageService from '@services/imageService';
import UserService from '@services/userService';
import { useAuth } from '@context/AuthContext';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Images.css';
import '@styles/Posts.css';
import '@styles/Feed.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';
import DotsIcon from '@assets/icons/DotsIcon';
import TrashIcon from '@assets/icons/TrashIcon';
import UserIcon from '@assets/icons/UserIcon';


const ImageViewing = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();
    const navigate = useNavigate();

    const imageDropdownRef = useRef(null);
    const [ imageDropdownActive, setImageDropdownActive ] = useState(false);

    const { user } = useAuth();

    const [ image, setImage ] = useState(null);
    const [ imageLoaded, setImageLoaded ] = useState(false);

    useEffect(() => {
        const fetchImage = async (imageId) => {
            const service = new ImageService(cookies.token);

            try {
                const fetchedImage = await service.getImage(imageId);

                setImage(fetchedImage);
                setImageLoaded(true);

                document.title = `${fetchedImage.user.firstName}'s picture`;

            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');

                } else {
                    console.error(err);
                }
            }

        }

        fetchImage(params.imageId);

    }, [params.imageId, cookies.token, navigate]);

    useEffect(() => {
        if (!imageLoaded) return;
        
        if (image.user._id !== user._id) return;

        if (!imageDropdownActive) {
            imageDropdownRef.current.classList.remove("show");
            return;
        }

        const handleClick = (e) => {
            if (!imageDropdownRef.current.contains(e.target)) {
                setImageDropdownActive(false);
            }
        }

        imageDropdownRef.current.classList.add("show");

        document.addEventListener("click", handleClick);

        return () => {
            document.removeEventListener("click", handleClick);
        }

    }, [imageDropdownActive, imageLoaded, image, user._id]);

    const toggleImageDropdown = (event) => {
        event.stopPropagation();

        setImageDropdownActive(!imageDropdownActive);
    }

    const updateProfilePicture = async () => {
        const service = new UserService(cookies.token);

        try {
            await service.updateUser({ profilePicture: image._id });
            navigate('/account');

        } catch (err) {
            console.error(err);
        }
    }

    const deleteImage = async () => {
        const service = new ImageService(cookies.token);

        try {
            await service.deleteImage(image._id);
            navigate(`/users/${user._id}/images`);

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-imageview-container'>
                {imageLoaded ? 
                    <div className='imageview-content-container'>
                        <div className='post-header'>
                            <div style={{ display: 'flex' }}>
                                <div style={{ padding: '5px' }}>
                                    <Link to={`/users/${image.user._id}`}>
                                        <img
                                            className='feed-avatar'
                                            alt='test avatar'
                                            src={getImageUrl(image.user.profilePicture?.path) || avatarPlaceholder}
                                        />
                                    </Link>
                                </div>
                                <div className='post-info'>
                                    <Link to={`/users/${image.user._id}`} className='post-creator'>
                                        <span>{image.user.firstName} {image.user.lastName}</span>
                                    </Link>
                                    <span className='post-timestamp'>{new Date(image.timestamp).toLocaleString()}</span>
                                </div>
                            </div>
                            {image.user._id === user._id &&
                                <>
                                    <button type='button' className='dropdown-dots' onClick={toggleImageDropdown}>
                                        <DotsIcon />
                                    </button>
                                    
                                    <div className='dropdown' id='image-dropdown' ref={imageDropdownRef}>
                                        <button type='button' onClick={updateProfilePicture} style={{ color: 'var(--bs-gray-600)' }}><UserIcon /> Set as profile picture</button>
                                        <button type='button' onClick={deleteImage} style={{ color: 'var(--bs-red)' }}><TrashIcon /> Delete image</button>
                                    </div>
                                </>
                            }
                        </div>
                        <div className='imageview-image'>
                            <img style={{ width: '90%' }} src={getImageUrl(image.path)} alt={image._id} />
                        </div>
                    </div> :
                    <span className='loader' style={{ position: 'relative', left: '50%' }} />
                }
            </div>
        </main>
    );
}


export default ImageViewing;
