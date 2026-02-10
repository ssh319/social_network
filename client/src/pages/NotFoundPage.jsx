import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';
import ErrorFaceIcon from "@assets/icons/ErrorFaceIcon";


const NotFoundPage = () => {
    useEffect(() => {
        document.title = "Not Found";
    }, []);

    return (
        <main>
            <div className='error-container'>
                <ErrorFaceIcon color='var(--bs-gray-700)' />
                <span><strong>404</strong> Not Found</span>
                <Link to='/' style={{ marginTop: '20px' }}>
                    <button type='button' className='btn btn-outline-primary' style={{ fontSize: '20px' }}>Home page</button>
                </Link>
            </div>
        </main>
    )
}


export default NotFoundPage;
