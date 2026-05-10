import { useEffect, useState, useRef } from 'react';
import { useCookies } from 'react-cookie';
import { useNavigate, useParams, Link } from 'react-router-dom';

import ChatService from '@services/chatService';
import { useAuth } from '@context/AuthContext';
import { useSocket } from '@context/SocketContext';
import getImageUrl from '@utils/getImageUrl';

import '@styles/Chats.css';

import avatarPlaceholder from '@assets/images/avatar-placeholder.jpg';

import SendIcon from '@assets/icons/SendIcon';
import ArrowIcon from '@assets/icons/ArrowIcon';
import LastActive from '@components/LastActive';


const ChatsPage = () => {

    const [ cookies ] = useCookies(["token"]);
    const navigate = useNavigate();
    const params = useParams();

    const { user } = useAuth();
    const { socket, setNotifications } = useSocket();

    const messageInputRef = useRef(null);
    const sendButtonRef = useRef(null);
    const chatsList = useRef(null);
    const convoSection = useRef(null);
    
    const [ chats, setChats ] = useState([]);
    const [ chatsLoaded, setChatsLoaded ] = useState(false);

    const [ convo, setConvo ] = useState(null);
    const [ convoLoaded, setConvoLoaded ] = useState(false);

    const [ messageText, setMessageText ] = useState("");

    
    useEffect(() => {
        
        document.title = "Messages";

        socket.on("newMessage", msg => {
            if (convo && convo._id === msg.chat) {
                setConvo({ ...convo, messages: [ msg, ...convo.messages ] });
            };

            setChats([
                { ...chats.find(chat => chat._id === msg.chat), lastMessage: msg },
                ...chats.filter(chat => chat._id !== msg.chat)
            ]);
        });

        return () => {
            socket.off("newMessage");
        }

    }, [socket, convo, user._id, chats]);


    useEffect(() => {
        setConvo(null);
        setConvoLoaded(false);

        const service = new ChatService(cookies.token);

        const chatsListElement = chatsList.current;
        const convoSectionElement = convoSection.current;

        const loadChats = async () => {
            try {
                let chats = await service.retrieveChats();

                chats.sort((a, b) => new Date(b.lastMessage?.timestamp) - new Date(a.lastMessage?.timestamp));

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
                setNotifications(prev => prev.filter(n => n.type !== 'message' || n.sender._id !== chat.peer._id));

            } catch (err) {
                if (err.response?.status < 500) {
                    navigate('/not-found');

                } else {
                    console.error(err);
                }
            }
        }

        if (params.chatId) {
            chatsListElement.classList.add('mobile-chat');
            convoSectionElement.classList.add('mobile-chat');
            loadConvo(params.chatId);
        }

        return () => {
            chatsListElement.classList.remove('mobile-chat');
            convoSectionElement.classList.remove('mobile-chat');
        }

    }, [cookies.token, params.chatId, navigate, user._id, setNotifications]);

    const handleMessageChange = (event) => {
        setMessageText(event.target.value);
    }

    const sendMessage = async (event) => {
        event.preventDefault();

        sendButtonRef.current.disabled = true;

        messageInputRef.current.value = "";
        
        if (!messageText.trim()) {
            sendButtonRef.current.disabled = false;
            return;
        }
        
        const service = new ChatService(cookies.token);
        
        try {
            const newMessage = await service.sendMessage(convo._id, { text: messageText });
            setConvo({ ...convo, messages: [ newMessage, ...convo.messages ] });
            setChats([
                { ...chats.find(chat => chat._id === convo._id), lastMessage: newMessage },
                ...chats.filter(chat => chat._id !== convo._id)
            ]);
            setMessageText("");
            sendButtonRef.current.disabled = false;

        } catch (err) {
            console.error(err);
        }
    }


    return (
        <main>
            <div className='main-chatspage-container'>
                <div className='chats-section'>
                    <ul ref={chatsList} className='chats-list-sidenav'>
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
                                            src={
                                                (chat.primaryUser._id === user._id ?
                                                    getImageUrl(chat.secondaryUser.profilePicture?.path) :
                                                    getImageUrl(chat.primaryUser.profilePicture?.path)
                                                ) || avatarPlaceholder
                                            }
                                            width={28}
                                            height={28}
                                            style={{ borderRadius: '50%' }}
                                        />
                                        <div style={{ display: 'flex', overflow: 'hidden', flexDirection: 'column', gap: '3px' }}>
                                            <span>
                                                {chat.primaryUser._id === user._id ?
                                                    `${chat.secondaryUser.firstName} ${chat.secondaryUser.lastName}` :
                                                    `${chat.primaryUser.firstName} ${chat.primaryUser.lastName}`
                                                }
                                            </span>
                                            {chat.lastMessage &&
                                                <span style={{ color: 'var(--bs-gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
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
                    <div ref={convoSection} className='convo-section'>
                        {!params.chatId ?
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <span style={{ fontSize: '21px', color: 'var(--bs-gray-500)' }}>Select chat.</span>
                            </div> :
                            <>
                                {convoLoaded ?
                                    <>
                                        <Link to='/chats' className='mobile-back-button'>
                                            <ArrowIcon style={{ transform: 'rotate(180deg)' }} />
                                        </Link>
                                        <div className='peer-info'>
                                            <img alt='Peer avatar' src={getImageUrl(convo.peer.profilePicture?.path) || avatarPlaceholder} width={28} height={28} style={{ borderRadius: '50%' }} />
                                            <div>
                                                <Link to={`/users/${convo.peer._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{convo.peer.firstName} {convo.peer.lastName}</Link>
                                                <span style={{ fontWeight: '400' }}><LastActive lastActive={convo.peer.lastActive} /></span>
                                            </div>
                                            
                                        </div>
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
                                                                src={
                                                                    (msg.user === convo.me._id ?
                                                                        getImageUrl(convo.me.profilePicture?.path) :
                                                                        getImageUrl(convo.peer.profilePicture?.path)
                                                                    ) || avatarPlaceholder
                                                                }
                                                                width={28}
                                                                height={28}
                                                                style={{ borderRadius: '50%' }}
                                                            />
                                                        </Link>

                                                        <Link to={`/users/${msg.user}`} style={{ textDecoration: 'none' }}>
                                                            <span style={{ color: 'var(--text)' }}>
                                                                {msg.user === convo.me._id ?
                                                                    `${convo.me.firstName} ${convo.me.lastName}` :
                                                                    `${convo.peer.firstName} ${convo.peer.lastName}`
                                                                }
                                                            </span>
                                                        </Link>
                                                    </div>

                                                    <span style={{ width: '85%' }}>{msg.text}</span>

                                                    <span style={{ fontSize: '11px', color: 'var(--bs-gray-500)' }}>
                                                        {new Date(msg.timestamp).toLocaleString()}
                                                    </span>
                                                    {/* {msg.user === convo.me._id &&
                                                        <div>
                                                            {msg.isRead ? 
                                                                <span>read</span> :
                                                                <span>not read</span>
                                                            }
                                                        </div>
                                                    } */}
                                                </div>
                                            ))}
                                        </div>
                                        <form className='convo-message-form' onSubmit={sendMessage}>
                                            <input
                                                ref={messageInputRef}
                                                type='text'
                                                onChange={handleMessageChange}
                                                className='form-control message-input'
                                                placeholder='Enter your message...'
                                            />
                                            <button ref={sendButtonRef} type='submit' className='send-btn'>
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
