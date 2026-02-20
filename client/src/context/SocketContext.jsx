import { useEffect, useState, createContext, useContext } from 'react';
import { useCookies } from 'react-cookie';

import { useAuth } from './AuthContext';
import socket from '../socket';


const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {

    const { user } = useAuth();
    const [ cookies ] = useCookies(['token']);

    const [ notifications, setNotifications ] = useState([]);

    useEffect(() => {
        if (cookies.token && user && socket.disconnected) {
            socket.auth = { token: cookies.token };
            socket.connect();
    
            socket.on('notification', data => {
                setNotifications(prev => [...prev, data]);
            });
        }

        if (!user && socket.connected) {
            socket.off('notification');
            socket.disconnect();
        }
    }, [user, cookies.token]);

    const value = {
        socket,
        notifications
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}


export const useSocket = () => useContext(SocketContext);
