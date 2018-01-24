import { h, app } from 'hyperapp'
import * as firebase from 'firebase'
import randomcolor from 'randomcolor'

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
    };
  },

  addMessage: message => state => {
    const user = state.users[message.userId];
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
    };
  },

  mergeUser: user => state => ({
    user: state.user,
    name: state.name,
    users: Object.assign({}, state.users, { [user.id]: user }),
    messages: state.messages,
    message: state.message,
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
    }

  },

  messageChanged: message => state => ({
    user: state.user,
    name: state.name,
    users: state.users,
    messages: state.messages,
    message: message,
  }),

  nameChanged: name => state => ({
    user: state.user,
    name: name,
    users: state.users,
    messages: state.messages,
    message: state.message,
  })
}

const view = (state, actions) => (
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

    <div class="messages">
      {state.messages.map((message, idx) => {
        const isFromMe = state.user && message.userId === state.user.uid
        const style = {
          alignSelf: isFromMe ? 'flex-end' : 'flex-start',
          backgroundColor: message.user.color,
        }
        return (
          <div key={message.id} class="message" style={style}>
            <div class="message-author">{message.user.name}</div>
            <div class="message-body">{message.text}</div>
            <div class="message-date">{(new Date(message.createdAt)).toISOString()}</div>
          </div>
        );
      })}
    </div>
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

const chat = app(state, actions, view, document.getElementById('root'));

firebase.database()
  .ref("users")
  .on("child_added", (snapshot) => {
    chat.mergeUser({
      id: snapshot.key,
      name: snapshot.val(),
      color: randomcolor({ luminosity: 'bright', format: 'rgba', alpha: 0.8 })
    })
  });

firebase.auth()
  .onAuthStateChanged((user) => {
    chat.setAuth(user)
  });

firebase.database()
  .ref('messages')
  .on('child_added', (snapshot) => {
    const v = snapshot.val();
    chat.addMessage(v);
  });

