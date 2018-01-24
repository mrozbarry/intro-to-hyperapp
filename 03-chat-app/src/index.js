import { h, app } from 'hyperapp';
import * as firebase from 'firebase';
import randomcolor from 'randomcolor';
import Identicon from 'identicon.js';

import './index.css';

firebase.initializeApp({
  apiKey: "AIzaSyBQWJQT29mFsSwlGDWXrgIwgVYddpDQ8aQ",
  authDomain: "hyperapp-chat.firebaseapp.com",
  databaseURL: "https://hyperapp-chat.firebaseio.com",
  projectId: "hyperapp-chat",
})

const state = {
  user: null,
  name: 'User',
  users: {},
  messages: [],
  message: '',
  messagesDiv: document.createElement('div'),
  loading: ['users'],
}

const actions = {
  login: name => (state) => {
    if (!name) return state

    firebase.auth().signInAnonymously()
      .then((user) => {
        return firebase.database()
          .ref("users")
          .child(user.uid)
          .set(name);
      });
  },

  logout: () => (state, action) => {
    return firebase.database()
      .ref('users')
      .child(state.user.uid)
      .remove()
      .then(() => {
        firebase.auth().signOut();
      })
  },

  setAuth: user => state => {
    const chatUser = user !== null
      ? state.users[user.uid]
      : null;

    return {
      user: user,
      name: user && chatUser ? chatUser.name : state.name,
      users: state.users,
      messages: state.messages,
      message: '',
      messagesDiv: state.messagesDiv,
      loading: state.loading,
    };
  },

  addMessage: message => state => {
    const user = state.users[message.userId] || {
      name: '[deleted]',
      color: randomcolor({ luminosity: 'bright', format: 'rgb' }),
      avatarSrc: 'about:blank',
    };
    const messageWithUser = Object.assign({ user: user }, message);

    const messages = state.messages
      .concat(messageWithUser)
      .sort((a, b) => Math.sign(a.createdAt - b.createdAt))

    return {
      user: state.user,
      name: state.name,
      users: state.users,
      messages: messages,
      message: state.message,
      messagesDiv: state.messagesDiv,
      loading: state.loading,
    };
  },

  setUsers: users => state => ({
    user: state.user,
    name: state.name,
    users: users,
    messages: state.messages,
    message: state.message,
    messagesDiv: state.messagesDiv,
    loading: state.loading.filter(l => l !== 'users'),
  }),

  mergeUser: user => state => ({
    user: state.user,
    name: state.name,
    users: Object.assign({}, state.users, { [user.id]: user }),
    messages: state.messages,
    message: state.message,
    messagesDiv: state.messagesDiv,
    loading: state.loading,
  }),

  sendMessage: text => (state, actions) => {
    const message = {
      userId: state.user.uid,
      text: text,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    }

    firebase.database()
      .ref("messages")
      .push(message)
      .then(() => {
        actions.addMessage(
          Object.assign({}, message, { createdAt: Date.now() })
        );
      })

    return {
      user: state.user,
      name: state.name,
      users: state.users,
      messages: state.messages.concat(),
      message: '',
      messagesDiv: state.messagesDiv,
      loading: state.loading,
    }
  },

  messageChanged: message => state => ({
    user: state.user,
    name: state.name,
    users: state.users,
    messages: state.messages,
    message: message,
    messagesDiv: state.messagesDiv,
    loading: state.loading,
  }),

  nameChanged: name => state => ({
    user: state.user,
    name: name,
    users: state.users,
    messages: state.messages,
    message: state.message,
    messagesDiv: state.messagesDiv,
    loading: state.loading,
  }),

  setMessagesDiv: element => state => ({
    user: state.user,
    name: name,
    users: state.users,
    messages: state.messages,
    message: state.message,
    messagesDiv: element,
    loading: state.loading,
  }),

  scrollMessages: messageElement => state => {
    console.log('scrollMessages', state.messagesDiv, messageElement);
    state.messagesDiv.scrollTop = messageElement.offsetTop;
  },
}

const Message = ({ isFromMe, message, actions }) => {
  const classes = ['message'].concat(isFromMe ? 'me' : []).join(' ')

  const style = {
    backgroundColor: message.user.color,
  }

  return (
    <div
      class={classes}
      style={style}
      oncreate={element => actions.scrollMessages(element)}
    >
      <div class="message-author">{message.user.name}</div>
      <div class="message-body">{message.text}</div>
      <div class="message-date">{(new Date(message.createdAt)).toISOString()}</div>
    </div>
  );
}

const Messages = ({ state, actions }) => {
  return (
    <div
      class="messages"
      oncreate={element => actions.setMessagesDiv(element)}
      onupdate={element => actions.setMessagesDiv(element)}
      ondestroy={element => actions.setMessagesDiv(element)}
    >
      {state.messagesDiv && state.messages.map((message, idx) => (
        <Message
          key={message.id}
          message={message}
          isFromMe={state.user && state.user.uid === message.userId}
          actions={actions}
        />
      ))}
    </div>
  )
}

const view = (state, actions) => {
  return (
    <div class="layout">
      <div class="auth-bar">
        <input
          class="auth-bar-name"
          placeholder="Username"
          value={state.name}
          disabled={Boolean(state.user)}
          oninput={(e) => actions.nameChanged(e.target.value)}
        />
        <button class="auth-bar-button" onclick={() => actions.login(state.name)} disabled={Boolean(state.user)}>
          Login
        </button>
        <button class="auth-bar-button" onclick={() => actions.logout()} disabled={!Boolean(state.user)}>
          Logout
        </button>
      </div>

      {state.loading.length === 0 && <Messages state={state} actions={actions} />}
      {state.loading.length > 0 && <div class="loading">Loading...</div>}

      <div class="my-message">
        <input
          value={state.message}
          disabled={!Boolean(state.user)}
          oninput={(e) => actions.messageChanged(e.target.value)}
          onkeydown={(e) => {
            if (e.which === 13) {
              e.preventDefault()
              actions.sendMessage(state.message)
            }
          }}
          placeholder="Add your message"
        />
      </div>
    </div>
  );
}

const chat = app(state, actions, view, document.getElementById('root'));

const buildUser = (id, name) => ({
  id: id,
  name: name,
  color: randomcolor({ luminosity: 'bright', format: 'rgb' }),
  avatarSrc: `data:image/avg+xml;utf8,${(new Identicon(id, { format: 'svg' })).toString(true)}`,
})

firebase.database()
  .ref("users")
  .once("value", (snapshot) => {
    const usersFromDB = snapshot.val();
    const users = Object.keys(usersFromDB).reduce((nextUsers, userId) => {
      return Object.assign({
        [userId]: buildUser(userId, usersFromDB[userId]),
      }, nextUsers);
    }, {});

    chat.setUsers(users);

    firebase.database()
      .ref("users")
      .on("child_added", (snapshot) => {
        chat.mergeUser(buildUser(snapshot.key, snapshot.val()));
      });

    firebase.database()
      .ref('messages')
      .on('child_added', (snapshot) => {
        const v = snapshot.val();
        chat.addMessage(v);
      });

  })

firebase.auth()
  .onAuthStateChanged((user) => {
    chat.setAuth(user)
  });

