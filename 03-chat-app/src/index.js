import { h, app } from 'hyperapp'
import * as firebase from 'firebase'

firebase.initializeApp({
  apiKey: "AIzaSyBQWJQT29mFsSwlGDWXrgIwgVYddpDQ8aQ",
  authDomain: "hyperapp-chat.firebaseapp.com",
  databaseURL: "https://hyperapp-chat.firebaseio.com",
  projectId: "hyperapp-chat",
})

const state = {
  user: null,
  name: 'User',
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
          .set(name)
      })
  },

  logout: () => (state, action) => {
    firebase.auth().signOut()
  },

  setAuth: user => state => ({
    user: user,
    name: state.name,
    users: state.users,
    messages: state.messages,
    message: ''
  }),

  addMessage: message => state => ({
    user: state.user,
    name: state.name,
    users: state.users,
    messages: state.messages.concat(message),
    message: state.message,
  }),

  setUsers: users => state => ({
    user: state.user,
    name: state.name,
    users: users,
    messages: state.messages,
    message: state.message,
  }),

  sendMessage: text => state => {
    const message = {
      userId: state.user.uid,
      text: text,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    }

    firebase.database()
      .ref("messages")
      .push(message)

    return {
      user: state.user,
      name: state.name,
      users: state.users,
      messages: state.messages.concat(Object.assign({}, message, { createdAt: Date.now() })),
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
  <div>
    <input
      placeholder="Username"
      value={state.name}
      disabled={Boolean(state.user)}
      oninput={(e) => actions.nameChanged(e.target.value)}
      onkeydown={(e) => {
        if (e.which === 13) {
          console.log('do that login')
          e.preventDefault()
          actions.login(state.name)
        }
      }}
    />
    <button onclick={() => actions.logout()} disabled={!Boolean(state.user)}>
      Logout
    </button>
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
    <div>{state.messages.map((message, idx) => (<div key={idx}>{JSON.stringify(message)}</div>))}</div>
  </div>
)

const chat = app(state, actions, view, document.getElementById('root'))

firebase.auth()
  .onAuthStateChanged((user) => {
    chat.setAuth(user)
  })

firebase.database()
  .ref('messages')
  .on('child_added', (snapshot) => {
    const v = snapshot.val()
    console.log('new message', v)
    chat.addMessage(v)
  })

firebase.database()
  .ref("users")
  .on("value", (snapshot) => {
    const users = snapshot.val()
    if (!users) return chat.setUsers([])

    chat.setUsers(
      Object.keys(users)
        .map((id) => ({ id: id, name: users[id] }))
    )
  })

setTimeout(() => {
  chat.addMessage({ userId: -1, text: "----------------", createdAt: 0 })
}, 1000)
