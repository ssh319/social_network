import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';
import ErrorFaceIcon from '@assets/icons/ErrorFaceIcon';


const ErrorPage = () => {
    useEffect(() => {
        document.title = "Error occurred";
    }, []);

    const location = useLocation();
    
    const prevAddress = location.state?.prevAddress;
    
    return (
        <main>
            <div className='error-container'>
                <ErrorFaceIcon color='var(--bs-gray-700)' />
                <span>Something went wrong</span>
                <Link to={prevAddress} style={{ marginTop: '20px' }}>
                    <button type='button' className='btn btn-outline-primary' style={{ fontSize: '20px' }}>Try Again</button>
                </Link>
                <Link to='/' style={{ marginTop: '15px' }}>
                    <button type='button' className='btn btn-outline-primary' style={{ fontSize: '20px' }}>Home page</button>
                </Link>
            </div>
        </main>
    );
}


export default ErrorPage;
