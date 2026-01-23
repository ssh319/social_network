import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';


const ErrorPage = () => {
    useEffect(() => {
        document.title = "Error occurred";
    }, []);

    const location = useLocation();
    
    const prevAddress = location.state?.prevAddress;
    
    return (
        <main style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>
                <span>Something went wrong ;(</span><br />
                <Link to={prevAddress}>
                    <button className='btn btn-primary'>Try Again</button>
                </Link>
            </div>
        </main>
    )
}


export default ErrorPage;
