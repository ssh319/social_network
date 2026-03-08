import { useEffect, useState, createContext, useContext, useCallback, useRef } from 'react';
import { useCookies } from 'react-cookie';

import { useAuth } from './AuthContext';
import socket from '../socket';

import notificationSound from '@assets/audio/notification.mp3';
import silenceSound from '@assets/audio/silence.mp3';


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const { user } = useAuth();
    const [ cookies ] = useCookies(['token']);

    const [ notifications, setNotifications ] = useState([]);

    const audioRef = useRef(new Audio(silenceSound));

    const unlockedAudioRef = useRef(null);

    useEffect(() => {
        if (cookies.token && user && socket.disconnected) {
            socket.auth = { token: cookies.token };
            socket.connect();
            
            const unlockAudio = () => {
                if (unlockedAudioRef.current) return;

                audioRef.current.currentTime = 0;
                
                audioRef.current.play()
                    .then(() => {
                        audioRef.current.pause();
                        audioRef.current.currentTime = 0;
                        unlockedAudioRef.current = true;
                        audioRef.current = new Audio(notificationSound);
                    })
                    .catch(() => {});
            }
            
            ['click', 'scroll', 'touchstart', 'touchend', 'pointerdown', 'keydown'].forEach(evt =>
                window.addEventListener(evt, unlockAudio, { once: true })
            );
    
            socket.on('notification', data => {
                setNotifications(prev => [data, ...prev]);

                if (unlockedAudioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                }
            });
        }

        if (!user && socket.connected) {
            socket.off('notification');
            socket.disconnect();
        }
    }, [user, cookies.token]);


    const value = {
        socket,
        notifications,
        setNotifications: useCallback(setNotifications, [setNotifications])
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}


export const useSocket = () => useContext(SocketContext);
