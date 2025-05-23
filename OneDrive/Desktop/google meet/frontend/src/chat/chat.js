import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useStyles from './styles';
import { List, ListItem, Typography, TextField, Button } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import Avatar from 'react-avatar';
import config from '../config';
import io from 'socket.io-client';

const socket = io(config.SOCKET_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  path: '/socket.io/',
  forceNew: true,
  autoConnect: true
});

const Chat = ({ teamId }) => {

  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    socket.emit('join', { teamId });

    socket.on('message', (newMessage) => {
      setChats((prevChats) => [...prevChats, newMessage]);
    });

    return () => {
      socket.off('message');
    };
  }, [teamId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: message,
          senderEmail: currentUser.email,
          senderUid: currentUser.uid,
          sentAt: new Date(),
          teamId: teamId
        })
      });

      if (response.ok) {
        setMessage('');
        // Refresh chats after sending
        fetchChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  const fetchChats = async () => {
    try {
      const response = await fetch(`${config.API_BASE_URL}/api/chats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div className={classes.root}>
      <Typography
          variant='h4'
          className={classes.title}
      >
          COMMUNITY POSTS
      </Typography>
      <List>
        <ListItem
          className={classes.createPost}
        >

          {/* FORM TO ENTER MESSAGE */}

          <form onSubmit={sendMessage} style={{ justifyContent:'center' }}>
            <TextField
                id="outlined-basic"  
                variant="outlined"
                placeholder='Post your message...'
                value={message}
                onChange = {(e)=>{setMessage(e.target.value)}}
                className={classes.textField}  
            />
            <Button
              type='submit'
              startIcon={<SendIcon style={{ fontSize: '2rem', color: '#ffffff' }}/>}
            />
          </form>

        {/* ALL CHATS */}

        </ListItem>
        {
          chats.map(
            (chat)=>{
              return (
                <ListItem
                  className={classes.posts}
                >
                    <Avatar 
                      style={{ margin: '1%' }}
                      name={chat.senderEmail} 
                      size='40' 
                      textSizeRatio={1.75} 
                      round={true}
                    />
                    <Typography>
                        <Typography variant='subtitle2'>{chat.senderEmail}</Typography>
                        <Typography variant='caption'>
                        {new Date(chat.sentAt).toLocaleDateString("en-US")},
                        {new Date(chat.sentAt).getHours()}:{new Date(chat.sentAt).getMinutes()}
                        </Typography>
                        <Typography>{chat.message}</Typography>
                    </Typography>
                </ListItem>
              )
            }
          )
        }
      </List>
    </div>
  )
}

export default Chat;