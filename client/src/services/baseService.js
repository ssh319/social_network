import axios from 'axios';


const BASE_URL = "http://localhost:8080";

class BaseService {
    constructor(authToken) {
        if (authToken) {
            this.authHeader = `Bearer ${authToken}`;
        }

        this.api = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                Authorization: this.authHeader
            }
        });
    }
}


export default BaseService;
