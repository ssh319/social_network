import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

import UserService from '@services/userService';
import ImageService from '@services/imageService';

import getImageUrl from '@utils/getImageUrl';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';


const AccountManagementPage = () => {
    const [ cookies ] = useCookies(["token"]);

    const [ userLoaded, setUserLoaded ] = useState(false);
    const [ userData, setUserData ] = useState(null);
    const [ newData, setNewData ] = useState({});
    const [ submitResult, setSubmitResult ] = useState({});
    const [ passwordConfirm, setPasswordConfirm ] = useState("");
    const [ birthDate, setBirthDate ] = useState({});
    const [ image, setImage ] = useState(null);

    const editableUserData = {
        firstName: "First name",
        lastName: "Last name",
        publicStatus: "Public status",
        email: "Email address",
        password: "Password",
        country: "Country",
        city: "City",
        birthDate: "Birth date",
        aboutMe: "About me"
    }

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ]
    
    useEffect(() => {
        const fetchUserData = async () => {
            const service = new UserService(cookies.token);

            try {
                const fetchedData = await service.getAccountData();
                setUserData(fetchedData);

                if (fetchedData.profilePicture) {
                    setImage(getImageUrl(fetchedData.profilePicture.path));
                }
                
                if (fetchedData.birthDate) {
                    const fetchedBirthDate = new Date(fetchedData.birthDate);

                    setBirthDate({
                        year: fetchedBirthDate.getFullYear().toString(),
                        month: fetchedBirthDate.getMonth().toString(),
                        day: fetchedBirthDate.getDate().toString()
                    });
                }

                setUserLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        fetchUserData();
    }, [cookies.token]);

    const editField = (value, key) => {
        setNewData(prev => ({ ...prev, [key]: value }));
    }

    const handlePasswordConfirmChange = (event) => {
        setPasswordConfirm(event.target.value);
    }

    const applyNewData = async () => {

        const updatedData = newData;
        
        if (Object.entries(updatedData).length === 0) {
            return setSubmitResult({});
        }

        if (updatedData.password && updatedData.password !== passwordConfirm) {
            return setSubmitResult({ success: false, message: "Passwords do not match" });
        }

        if (updatedData.birthDate) {
            let { year, month, day } = updatedData.birthDate;

            if ([ year, month, day ].every(val => !val)) {
                updatedData.birthDate = '';

            } else if ([ year, month, day ].some(val => !val)) {
                return setSubmitResult({ success: false, message: "Invalid user data" });

            } else {
                // Format months array index to a real month number
                month = Number(month) + 1;
    
                updatedData.birthDate = `${year}-${month < 10 ? '0' : ''}${month}-${day.length < 2 ? '0' : ''}${day}`;
            }
        }
        
        setUserLoaded(false);

        try {
            const service = new UserService(cookies.token);
            await service.updateUser(newData);

            const fetchedData = await service.getAccountData();
            setUserData(fetchedData);

            if (fetchedData.birthDate) {
                const fetchedBirthDate = new Date(fetchedData.birthDate);
                
                setBirthDate({
                    year: fetchedBirthDate.getFullYear().toString(),
                    month: fetchedBirthDate.getMonth().toString(),
                    day: fetchedBirthDate.getDate().toString()
                });
            }

            setSubmitResult({ success: true, message: "Changes applied!" });
            
        } catch (err) {
            if (err.response?.status === 400) {
                setSubmitResult({ success: false, message: "Invalid user data" });

            } else if (err.response?.status === 403) {
                setSubmitResult({ success: false, message: "Wrong old password provided" });

            } else {
                console.error(err);
                setSubmitResult({ success: false, message: "Unknown error occured" });
            }

        } finally {
            setNewData({});
            setUserLoaded(true);
        }
    }

    const handleImageUpload = async (event) => {
        const formData = new FormData();
        formData.append('image', event.target.files[0]);

        const imageService = new ImageService(cookies.token);
        const userService = new UserService(cookies.token);

        try {
            const newImage = await imageService.uploadImage(formData);
            await userService.updateUser({ profilePicture: newImage._id });

            setImage(getImageUrl(newImage.path));

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <main>
            <div className='main-params-container'>
                <div className='params-header'>Account management</div>
                {userLoaded ?
                    <>
                        <div style={{ padding: '15px 30px' }}>
                            <img alt='profile pic' src={image || avatarPlaceholder} width={128} height={128} />
                            <label htmlFor='profile-pic-upload'>
                                <input type='file' id='profile-pic-upload' accept='image/*' onChange={handleImageUpload} hidden />
                                <span className='btn btn-outline-primary' style={{ position: 'relative', left: '30px' }}>Upload profile picture</span>
                            </label>
                        </div>
                        <ul className='params-options'>
                            {Object.entries(editableUserData).map(([key, label]) =>
                                <li key={key}>
                                    <span style={{ width: '7rem' }}>{label}</span>
                                    {!['aboutMe', 'password', 'birthDate'].includes(key) ?
                                        <input
                                            className='form-control params-option-field'
                                            defaultValue={userData[key]}
                                            placeholder="Not specified"
                                            onChange={event => { editField(event.target.value, key) }}
                                        /> :
                                        <>
                                            {key === 'password' &&
                                                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '25px' }}>
                                                    <input
                                                        type='password'
                                                        className='form-control params-option-field'
                                                        placeholder="Enter your old password"
                                                        onChange={event => { editField(event.target.value, 'oldPassword') }}
                                                    />
                                                    <input
                                                        type='password'
                                                        className='form-control params-option-field'
                                                        placeholder="New password"
                                                        onChange={event => { editField(event.target.value, key) }}
                                                    />
                                                    <input
                                                        type='password'
                                                        className='form-control params-option-field'
                                                        placeholder="Confirm new password"
                                                        onChange={handlePasswordConfirmChange}
                                                    />
                                                </div>
                                            }

                                            {key === 'birthDate' &&
                                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                                    <input
                                                        className='form-control params-option-field'
                                                        placeholder='Year'
                                                        type='number'
                                                        min={1900}
                                                        max={2100}
                                                        defaultValue={birthDate.year}
                                                        onChange={event => setBirthDate(prev => {
                                                            editField(
                                                                { year: event.target.value, month: birthDate.month, day: birthDate.day },
                                                                key
                                                            );
                                                            return { ...prev, year: event.target.value };
                                                        })}
                                                    />
                                                    <select
                                                        className='form-control params-option-field'
                                                        style={{ fontSize: '14px', lineHeight: '110%', cursor: 'pointer' }}
                                                        onChange={event => setBirthDate(prev => {
                                                            editField(
                                                                { year: birthDate.year, month: event.target.value, day: birthDate.day },
                                                                key
                                                            );
                                                            return { ...prev, month: event.target.value }
                                                        })}
                                                        defaultValue={birthDate.month}
                                                    >
                                                        <option value=''>Select month</option>
                                                        {months.map((month, index) => (
                                                            <option key={index} value={index}>
                                                                {month}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className='form-control params-option-field'
                                                        placeholder='Day'
                                                        type='number'
                                                        min={1}
                                                        max={31}
                                                        defaultValue={birthDate.day}
                                                        onChange={event => setBirthDate(prev => {
                                                            editField(
                                                                { year: birthDate.year, month: birthDate.month, day: event.target.value },
                                                                key
                                                            );
                                                            return { ...prev, day: event.target.value };
                                                        })}
                                                    />
                                                </div>
                                            }

                                            {key === 'aboutMe' &&
                                                <textarea
                                                    className='form-control params-option-field'
                                                    defaultValue={userData[key]}
                                                    placeholder="Not specified"
                                                    style={{ height: '100px', resize: 'none' }}
                                                    onChange={event => { editField(event.target.value, key) }}
                                                />
                                            }
                                        </>
                                    }
                                </li>
                            )}

                            <div style={{ margin: '10px auto 0 auto', display: 'flex', alignItems: 'center', gap: '25px' }}>
                                <button
                                    onClick={applyNewData}
                                    className='btn btn-primary'
                                    style={{ width: '130px' }}
                                >Submit</button>
                                <span style={{ color: submitResult.success ? 'green' : 'red' }}>{submitResult.message}</span>
                            </div>
                        </ul>
                    </> :
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '90%' }}>
                        <span className='loader' style={{ width: '28px', height: '28px', borderWidth: '3px' }} />
                    </div>
                }
            </div>
        </main>
    );
}


export default AccountManagementPage;
