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
  login: name => (state, actions) => {
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
    firebase.auth().signout()
  }

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
    message: '',
  }),

  setUsers: users => state => ({
    user: state.user,
    name: state.name,
    users: users,
    messages: state.messages,
    message: state.message,
  }),

  sendMessage: text => state => {
    firebase.database()
      .ref("messages")
      .push({
        userId: state.user.uid,
        text: text,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
  },

  messageChanged: message => state => (
    user: state.user,
    name: state.name,
    users: state.users,
    messages: state.messages,
    message: message,
  })
}

/*
 * TODO: 
 *  - Need to be able to login
 *
 */
const view = (state, actions) => (
  <div>
    <div>{state.messages.map((message) => (<div>{JSON.stringify(message)}</div>))}</div>
  </div>
)

const chat = app(state, actions, view, document.getElementById('root'))

firebase.auth().onAuthStateChanged((user) => {
  chat.setAuth(user)
})

firebase.database()
  .ref('messages')
  .on('child_added', (snapshot) => {
    console.log('new message', snapshot.val())
    chat.addMessage(snapshot.val())
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
