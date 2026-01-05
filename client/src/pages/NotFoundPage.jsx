import { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import '../App.css';


const NotFoundPage = () => {
    useEffect(() => {
        document.title = "Page not found";
    }, []);

    return (
        <main>
            <h2 style={{ textAlign: 'center' }}>404</h2>
        </main>
    )
}


export default NotFoundPage;
