import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import '../../App.css';
import './Auth.css';

import UserService from '../../services/userService';


const SignupPage = () => {
    
    useEffect(() => {
        document.title = "Registration";
        document.body.classList.add("light");
    }, []);

    const service = new UserService();

    const [ email, setEmail ] = useState("");   
    const [ password, setPassword ] = useState("");
    const [ firstName, setFirstName ] = useState("");
    const [ lastName, setLastName ] = useState("");

    const [ errors, setErrors ] = useState([]);

    let handleEmailChange = (event) => {
        setEmail(event.target.value);
    }

    let handlePasswordChange = (event) => {
        setPassword(event.target.value);
    }

    let handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
    }

    let handleLastNameChange = (event) => {
        setLastName(event.target.value);
    }

    let registerUser = async (event) => {
        event.preventDefault();

        try {
            // const createdUser = 
            await service.createUser({ email, password, firstName, lastName });
            setErrors([]);

        } catch (err) {
            if (err.code === "ERR_NETWORK") {
                setErrors([
                    "Server connection failed"
                ]);

            } else if (err.response?.status === 500) {
                setErrors([
                    "Unknown internal error occured"
                ]);

            } else {
                setErrors(
                    err.response.data.errors ||
                    [ err.response.data.message ]
                );
            }
        }
    }

    return (
        <main>
            <section className="form-control auth-window">
                <h2 style={{ textAlign: 'center' }}>Sign Up</h2>
                <form onSubmit={registerUser}>
                    <input onChange={handleEmailChange} className="form-control auth-input" placeholder="E-mail" type="text" required />
                    <input onChange={handlePasswordChange} className="form-control auth-input" placeholder="Password" type="text" required />
                    <input onChange={handleFirstNameChange} className="form-control auth-input" placeholder="First Name" type="text" required />
                    <input onChange={handleLastNameChange} className="form-control auth-input" placeholder="Last Name" type="text" required />
                    <button type="submit" className="btn btn-primary">submit</button>
                </form>

                {errors &&
                    <ul style={{ color: 'red' }}>
                        {errors.map((error, id) => (
                                <li key={id}>
                                    {error}
                                </li>
                            ))
                        }
                    </ul>
                }
            </section>
        </main>
    );
}


export default SignupPage;
