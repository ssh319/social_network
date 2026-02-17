import { useAuth } from '@context/AuthContext';


const AccountManagementPage = () => {
    const { user } = useAuth();


    return (
        <main>
            <h1>{user.firstName} {user.lastName} account management</h1>
        </main>
    );
}


export default AccountManagementPage;
