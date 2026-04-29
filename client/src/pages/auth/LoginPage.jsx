import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';

import '@styles/Auth.css';

import UserService from '@services/userService';

import EyeFillIcon from '@assets/icons/EyeFillIcon.jsx';
import EyeSlashIcon from '@assets/icons/EyeSlashIcon.jsx';


const LoginPage = () => {

    useEffect(() => {
        document.title = "Social Network";
    }, []);

    const service = new UserService();

    const navigate = useNavigate();
    const location = useLocation();

    const [ , setCookie ] = useCookies(["token"]);

    const [ email, setEmail ] = useState("");   
    const [ password, setPassword ] = useState("");
    
    const [ errors, setErrors ] = useState({});

    const [ passwordVisibility, setPasswordVisibility ] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisibility);
    }

    let authenticateUser = async (event) => {
        event.preventDefault();

        try {
            const token = await service.authenticateUser({ email, password });
            setCookie("token", token, { path: "/", maxAge: 60 * 60 * 24 * 30 });
            navigate("/");

        } catch (err) {
            if (err.code === "ERR_NETWORK" || err.response?.status === 500) {
                navigate("/error-page", { state: { prevAddress: location.pathname } });

            } else {
                setErrors(err.response.data.errors);
            }
        }
    }

    return (
        <main>
            <div className='main-auth-container'>
                <section className="form-control auth-window">
                    <h2 className="auth-header">Sign in</h2>
                    <form onSubmit={authenticateUser}>

                        <div className='input-container'>
                            <input
                                onChange={e => { setEmail(e.target.value); }}
                                className="form-control auth-input"
                                style={{ borderColor: errors.email ? 'red' : 'var(--bs-border-color)' }}
                                placeholder="E-mail"
                                type="text"
                                required
                            />

                            {errors.email &&
                                <span className='error-message'>{errors.email}</span>
                            }

                        </div>

                        <div className='input-container'>

                            <input
                                onChange={e => { setPassword(e.target.value) }}
                                className="form-control auth-input"
                                style={{ borderColor: errors.password ? 'red' : 'var(--bs-border-color)' }}
                                placeholder="Password"
                                type={passwordVisibility ? 'text' : 'password'}
                                required
                            />

                            <button type='button' className='eye-icon' onClick={togglePasswordVisibility}>
                                {passwordVisibility ? <EyeSlashIcon color='black' /> : <EyeFillIcon color='black' />}
                            </button>

                            {errors.password &&
                                <span className='error-message'>{errors.password}</span>
                            }

                        </div>

                        <div style={{ fontSize: '14px', color: '#999' }}>
                            <span>Do not have an account? <Link to="/signup" style={{ textDecoration: 'none' }}>Sign up</Link></span>
                        </div>

                        <button type="submit" className="btn btn-primary submit-btn">Submit</button>
                    </form>
                </section>
            </div>
        </main>
    );
}


export default LoginPage;
