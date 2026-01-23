import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import '@styles/App.css';
import './Auth.css';

import UserService from '@services/userService';

import EyeFill from '@assets/icons/EyeFill.jsx';
import EyeSlash from '@assets/icons/EyeSlash.jsx';


const SignupPage = () => {
    
    useEffect(() => {
        document.title = "Social Network";
    }, []);

    const service = new UserService();
    const navigate = useNavigate();
    const location = useLocation();

    const [ , setCookie ] = useCookies(["token"]);

    const [ email, setEmail ] = useState("");   
    const [ password, setPassword ] = useState("");
    const [ confirmPassword, setConfirmPassword ] = useState("");
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");

    const [ errors, setErrors ] = useState({});
    
    const [ passwordVisibility, setPasswordVisibility ] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisibility(!passwordVisibility);
    }

    let registerUser = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        try {
            await service.createUser({ email, password, firstName, lastName });
            const token = await service.authenticateUser({ email, password });
            setCookie("token", token, { path: "/" });
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
            <section className="form-control auth-window">
                <h2 className="auth-header">Sign up</h2>
                <form onSubmit={registerUser}>

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
                            style={{
                                borderColor:
                                    (errors.password || errors.confirmPassword) ?
                                    'red' :
                                    'var(--bs-border-color)'
                            }}
                            placeholder="Password"
                            type={passwordVisibility ? 'text' : 'password'}
                            required
                        />

                        <button type='button' className='eye-icon' onClick={togglePasswordVisibility}>
                            {passwordVisibility ? <EyeSlash /> : <EyeFill />}
                        </button>

                        {errors.password &&
                            <span className='error-message'>{errors.password}</span>
                        }

                    </div>

                    <div className='input-container'>

                        <input
                            onChange={e => { setConfirmPassword(e.target.value) }}
                            className="form-control auth-input"
                            style={{ borderColor: errors.confirmPassword ? 'red' : 'var(--bs-border-color)' }}
                            placeholder="Confirm password"
                            type={passwordVisibility ? 'text' : 'password'}
                            required
                        />

                        <button type='button' className='eye-icon' onClick={togglePasswordVisibility}>
                            {passwordVisibility ? <EyeSlash /> : <EyeFill />}
                        </button>

                        {errors.confirmPassword &&
                            <span className='error-message'>{errors.confirmPassword}</span>
                        }

                    </div>

                    <div className='input-container'>
                        <input
                            onChange={e => { setFirstName(e.target.value) }}
                            className="form-control auth-input"
                            style={{ borderColor: errors.firstName ? 'red' : 'var(--bs-border-color)' }}
                            placeholder="First name"
                            type="text"
                            required
                        />

                        {errors.firstName &&
                            <span className='error-message'>{errors.firstName}</span>
                        }

                    </div>

                    <div className='input-container'>
                        <input
                            onChange={e => { setLastName(e.target.value) }}
                            className="form-control auth-input"
                            style={{ borderColor: errors.lastName ? 'red' : 'var(--bs-border-color)' }}
                            placeholder="Last name"
                            type="text"
                            required
                        />

                        {errors.lastName &&
                            <span className='error-message'>{errors.lastName}</span>
                        }
                        
                    </div>

                    <div style={{ fontSize: '14px', color: '#999' }}>
                        <span>Already have an account? <Link to="/login" style={{ textDecoration: 'none' }}>Sign in</Link></span>
                    </div>

                    <button type="submit" className="btn btn-primary submit-btn">Submit</button>

                </form>
            </section>
        </main>
    );
}


export default SignupPage;
