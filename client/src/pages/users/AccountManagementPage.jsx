import '@styles/App.css';

import { useAuth } from '@context/AuthContext';


const AccountManagementPage = () => {
    const { user } = useAuth();


    return (
        <h1>{user.firstName} {user.lastName} account</h1>
    );
}


export default AccountManagementPage;
