import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import ImageService from '@services/imageService';
import UserService from '@services/userService';
import { useAuth } from '@context/AuthContext';

import '@styles/Images.css';
import getImageUrl from '@utils/getImageUrl';
import PlusIcon from '@assets/icons/PlusIcon';


const ImagesPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const params = useParams();
    const navigate = useNavigate();

    const { user } = useAuth();

    const [ images, setImages ] = useState([]);
    const [ imagesLoaded, setImagesLoaded ] = useState(false);

    const fetchImages = useCallback(async () => {
        setImagesLoaded(false);
        const service = new UserService(cookies.token);

        try {
            const fetchedUser = await service.getUser(params.userId);
            document.title = `${fetchedUser.firstName} ${fetchedUser.lastName}'s images`;
            setImages(fetchedUser.images);
            setImagesLoaded(true);

        } catch (err) {
            if (err.response?.status < 500) {
                navigate('/not-found');

            } else {
                console.error(err);
            }
        }
    }, [cookies.token, navigate, params.userId]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const handleImageUpload = async (event) => {
        const formData = new FormData();
        formData.append('image', event.target.files[0]);
        
        const service = new ImageService(cookies.token);

        try {
            await service.uploadImage(formData);
            fetchImages();

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-imagespage-container'>
                <div className='imagespage-content-container'>
                    <div className='images-header'>
                        <div>
                            <span>Images</span>
                            <span style={{ color: 'var(--bs-gray-600)', marginLeft: '9px' }}>{images.length}</span>
                        </div>
                        {params.userId === user._id &&
                            <label htmlFor='image-upload'>
                                <input type='file' id='image-upload' accept='image/*' onChange={handleImageUpload} hidden />
                                <span className='btn btn-outline-primary' style={{ fontSize: '15px' }}><PlusIcon /> Upload new photo</span>
                            </label>
                        }
                    </div>
                    {imagesLoaded ? 
                            <ul className='images-list'>
                                {images.map(image => (
                                    <li key={image._id}>
                                        <Link to={`/images/${image._id}`}>
                                            <img className='image' alt={image._id} src={getImageUrl(image.path)} />
                                        </Link>
                                    </li>
                                ))}
                            </ul> :
                        <span className='loader' style={{
                            width: '28px',
                            height: '28px',
                            borderWidth: '3px',
                            position: 'relative',
                            left: '50%',
                            top: '35%'
                        }} />
                    }
                </div>
            </div>
        </main>
    );
}


export default ImagesPage;
