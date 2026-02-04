import { Navigate, Route, Routes } from 'react-router-dom';

import SignupPage from '@pages/auth/SignupPage';
import LoginPage from '@pages/auth/LoginPage';
import HomePage from '@pages/posts/HomePage';
import UserPage from '@pages/users/UserPage';
import SearchUsersPage from '@pages/users/SearchUsersPage';
import FriendsPage from '@pages/users/FriendsPage';
import AccountManagementPage from '@pages/users/AccountManagementPage';
import Header from '@components/Header';
import NotFoundPage from '@pages/NotFoundPage';
import ErrorPage from '@pages/ErrorPage';
import ProtectedRoute from '@context/ProtectedRoute';
import PostViewing from '@pages/posts/PostViewing';


const App = () => (
    <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Header />}>
            <Route index element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="users">
                <Route index element={<ProtectedRoute><SearchUsersPage /></ProtectedRoute>} />
                <Route path="friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
                <Route path=":userId" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
                <Route path=":userId/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
            </Route>
            <Route path="posts">
                <Route index element={<Navigate to="/" />} />
                <Route path=":postId" element={<ProtectedRoute><PostViewing /></ProtectedRoute>} />
            </Route>
            <Route path="account" element={<ProtectedRoute><AccountManagementPage /></ProtectedRoute>} />
        </Route>

        <Route path="error-page" element={<ErrorPage />} />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);


export default App;
