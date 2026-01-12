import { Route, Routes } from 'react-router-dom';

import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import HomePage from './pages/posts/HomePage';
import Header from './components/Header';
import NotFoundPage from './pages/NotFoundPage';


const App = () => (
    <Routes>
        <Route path="/" element={<Header />}>
            <Route index element={<HomePage />} />
        </Route>

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />}/>

        <Route path="*" element={<NotFoundPage />}/>
    </Routes>
);


export default App;
