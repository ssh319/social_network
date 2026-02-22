import axios from 'axios';


class BaseService {
    constructor(authToken) {
        if (authToken) {
            this.authHeader = `Bearer ${authToken}`;
        }

        this.api = axios.create({
            baseURL: process.env.REACT_APP_API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.authHeader
            }
        });
    }
}


export default BaseService;
