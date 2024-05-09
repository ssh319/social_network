import React from 'react';

// temp
import UserService from './services/userService';
import { useState } from 'react';


const App = () => {
    // token from postman
    const authToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NjMyOTEwYmMyYjE2MTRkYWRlNTViOTAiLCJpYXQiOjE3MTQ1ODk5NjgsImV4cCI6MTcxNTE5NDc2OH0.Qs77k5ivnwdUmDofQRp7yl_UGEnrz4rovR-yYSEVdOo';
    const userServiceClient = new UserService(authToken);

    let [data, setData] = useState({});

    const makeRequest = async () => {
        // test@testmail.com
        const result = await userServiceClient.getUser('6632910bc2b1614dade55b90');
        setData(result);
    }

    return (
        <main>
            <div>
                <button style={{ fontSize: '21px', padding: '9px' }} onClick={makeRequest}>Get 'test@testmail.com' user</button>
            </div>
            <br />
            <div style={{ fontSize: '21px' }}>
                <span>id: {data._id}</span>
                <br />
                <span>First name: {data.firstName}</span>
                <br />
                <span>Last name: {data.lastName}</span>
            </div>
        </main>
    );
}


export default App;
