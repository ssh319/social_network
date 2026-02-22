import { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams, Link } from 'react-router-dom';

import ChatService from '@services/chatService';
import { useAuth } from '@context/AuthContext';
import { useSocket } from '@context/SocketContext';

import './Chats.css';
import testAvatar from '@assets/images/test-avatar.jpg';
import SendIcon from '@assets/icons/SendIcon';


const ChatsPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const navigate = useNavigate();
    const params = useParams();

    const { user } = useAuth();
    const { socket } = useSocket();

    const messageInputRef = useRef(null);
    
    const [ chats, setChats ] = useState([]);
    const [ chatsLoaded, setChatsLoaded ] = useState(false);

    const [ convo, setConvo ] = useState(null);
    const [ convoLoaded, setConvoLoaded ] = useState(false);

    const [ messageText, setMessageText ] = useState("");

    
    useEffect(() => {
        
        document.title = "Messages";

        if (convo) {
            socket.on("newMessage", msg => {
                setConvo({ ...convo, messages: [ msg, ...convo.messages ] });
            });

            return () => {
                socket.off("newMessage");
            }
        }
    }, [socket, convo, user._id]);


    useEffect(() => {
        setConvo(null);
        setConvoLoaded(false);

        const service = new ChatService(cookies.token);

        const loadChats = async () => {
            try {
                let chats = await service.retrieveChats();

                setChats(chats);
                setChatsLoaded(true);

            } catch (err) {
                console.error(err);
            }
        }

        loadChats();

        const loadConvo = async (chatId) => {
            try {
                const chat = await service.getChat(chatId);

                chat.me = chat.primaryUser._id === user._id ? chat.primaryUser : chat.secondaryUser;
                chat.peer = chat.primaryUser._id === user._id ? chat.secondaryUser : chat.primaryUser;
                
                setConvo(chat);
                setConvoLoaded(true);

            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');

                } else {
                    console.error(err);
                }
            }
        }

        if (params.chatId) {
            loadConvo(params.chatId);
        }

    }, [cookies.token, params.chatId, navigate, user._id]);

    const handleMessageChange = (event) => {
        setMessageText(event.target.value);
    }

    const sendMessage = async (event) => {
        event.preventDefault();

        messageInputRef.current.value = "";

        if (!messageText.trim()) return;

        const service = new ChatService(cookies.token);

        try {
            const newMessage = await service.sendMessage(convo._id, { text: messageText });
            setConvo({ ...convo, messages: [ newMessage, ...convo.messages ] });

        } catch (err) {
            console.error(err);
        }
    }


    return (
        <main>
            <div className='main-chatspage-container'>
                <div className='chats-section'>
                    <ul className='chats-list-sidenav'>
                        {chatsLoaded ?
                            <>
                                {chats.map((chat, index) => (
                                    <li
                                        key={chat._id}
                                        className={convo?._id === chat._id ? 'focused' : ''}
                                        onClick={() => navigate(`/chats/${chat._id}`)}
                                        style={{ borderTopLeftRadius: index === 0 ? '9px' : '' }}
                                    >
                                        <img
                                            alt='test'
                                            src={testAvatar}
                                            width={28}
                                            height={28}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                            <span>
                                                {chat.primaryUser._id === user._id ?
                                                    `${chat.secondaryUser.firstName} ${chat.secondaryUser.lastName}` :
                                                    `${chat.primaryUser.firstName} ${chat.primaryUser.lastName}`
                                                }
                                            </span>
                                            {chat.lastMessage &&
                                                <span style={{ fontSize: '13px', color: 'var(--bs-gray-600)' }}>
                                                    {chat.lastMessage.text}
                                                </span>
                                            }
                                        </div>
                                    </li>
                                ))}
                            </> :
                            <span className='loader chat-loader' />
                        }
                    </ul>
                    <div className='convo-section'>
                        {!params.chatId ?
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <span style={{ fontSize: '21px', color: 'var(--bs-gray-500)' }}>Select chat.</span>
                            </div> :
                            <>
                                {convoLoaded ?
                                    <>
                                        <div className='convo-messages'>
                                            {convo && convo.messages.map(msg => (
                                                <div
                                                    key={msg._id}
                                                    className={
                                                        `message-container ${msg.user === convo.me._id ? 'from-me' : ''}`
                                                    }
                                                >
                                                    <div className={`message-sender ${msg.user === convo.me._id ? 'me' : ''}`}>
                                                        <Link to={`/users/${msg.user}`}>
                                                            <img 
                                                                alt='msg sender'
                                                                src={testAvatar}
                                                                width={28}
                                                                height={28}
                                                                style={{ borderRadius: '50%' }}
                                                            />
                                                        </Link>

                                                        <Link to={`/users/${msg.user}`} style={{ textDecoration: 'none' }}>
                                                            <span style={{ color: 'var(--bs-body-color)' }}>
                                                                {msg.user === convo.me._id ?
                                                                    `${convo.me.firstName} ${convo.me.lastName}` :
                                                                    `${convo.peer.firstName} ${convo.peer.lastName}`
                                                                }
                                                            </span>
                                                        </Link>
                                                    </div>

                                                    <span style={{ /* width: '70%' */ }}>{msg.text}</span>

                                                    <span style={{ fontSize: '11px', color: 'var(--bs-gray-500)' }}>
                                                        {new Date(msg.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <form className='convo-message-form' onSubmit={sendMessage}>
                                            <input
                                                ref={messageInputRef}
                                                type='text'
                                                onChange={handleMessageChange}
                                                className='message-input'
                                                placeholder='Enter your message...'
                                            />
                                            <button type='submit' className='send-btn'>
                                                <SendIcon style={{ position: 'relative', top: '0.5px', left: '1px' }} />
                                            </button>
                                        </form>
                                    </> :
                                    <span className='loader chat-loader' />
                                }
                            </>
                        }
                    </div>
                </div>
            </div>
        </main>
    );
}


export default ChatsPage;
