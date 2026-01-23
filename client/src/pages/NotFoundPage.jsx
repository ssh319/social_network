import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';


const NotFoundPage = () => {
    useEffect(() => {
        document.title = "Not Found";
    }, []);

    return (
        <main>
            <h2 style={{ textAlign: 'center' }}>404</h2>
        </main>
    )
}


export default NotFoundPage;
