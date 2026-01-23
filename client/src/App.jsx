import { Route, Routes } from 'react-router-dom';

import SignupPage from '@pages/auth/SignupPage';
import LoginPage from '@pages/auth/LoginPage';
import HomePage from '@pages/posts/HomePage';
import UserPage from '@pages/users/UserPage';
import Header from '@components/Header';
import NotFoundPage from '@pages/NotFoundPage';
import ErrorPage from '@pages/ErrorPage';
import ProtectedRoute from '@context/ProtectedRoute';


const App = () => (
    <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={<Header />}>
            <Route index element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/users/:userId" element={<ProtectedRoute><UserPage /></ProtectedRoute>} />
        </Route>

        <Route path="error-page" element={<ErrorPage />} />

        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);


export default App;
