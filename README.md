# Intro to Hyperapp

All apps can be run by running:

```bash
yarn
yarn start
```

To build the production version of the app:

```bash
yarn
yarn build
```

## What is hyperapp?

[Hyperapp](https://github.com/hyperapp/hyperapp) is an alternative to [React](https://github.com/facebook/react) based on [The Elm Architecture](https://guide.elm-lang.org/architecture/).

(Elm is a language that compiles to javascript. It is strongly typed, and guarantees :tm: to remove 100% of run-time errors. Elm borrows concepts from Haskell, Lisp, and OCamel.)

The general structure of a hyperapp looks like this:

```javascript
import { h, app } from 'hyperapp';

const initialState = {
  counter: 0,
};

const actions = {
  add: () => state => ({ counter: state.counter + 1 }),
  sub: () => state => ({ counter: state.counter - 1 }),
};

const view = (state, actions) => (
  <div>
    <h1>{state.counter}</h1>
    <button onclick={() => actions.add()}>+1</button>
    <button onclick={() => actions.sub()}>-1</button>
  </div>
);

const hyperApp = app(initialState, actions, view);
```

Notice that it looks similar to a React and Redux setup, but with considerable less setup, since the redux part is built in and not exposed to the developer.

## Apps

### [01 Simple List App](./01-simple-list/)

This app is a comparison between react and hyperapp.

#### What it does

 - Renders a list with an input box at the end
 - You can type text into the input
 - Presses enter in the input will
   - Add a new item to the list
   - Clear the current input
   - Not lose focus on the input

#### Comparison

|             | Lines of Code | Number of Packages | Source Code Size | Compiled App Size |
| ----------- | ------------- | ------------------ | ---------------- | ----------------- |
| React       | 47            | 8                  | 962 bytes        | 1.9 megabytes     |
| Hyperapp    | 37            | 7                  | 875 bytes        | 29 kilobytes      |

---

### [02 Tic Tac Toe](./02-tic-tac-toe/)

Simple hyperapp tic tac toe game

#### What it does

 - Renders tic-tac-toe board
 - Mouse click on a cell places the player X or O
   - A player cannot place an X or O where there is one already
   - A player cannot place a letter if the game is over
   - A successful mouse click will either end the game, or switch the current player
 - Game ends in one of two scenarios
   - A player occupies a full row, column, or diagonal
   - The board is completely filled
 - The board can be reset by click on a "New Game" button

---

### [03 Chat App](./03-chat-app/)

Hyperapp using firebase to have a real-time chat app.

### What it should do

 - Uses firebase
   - [x] Sign in
   - [x] Sign out
   - [x] Send message
   - [x] Receive messages
 - UI
   - [ ] Allow user to set a name and sign in
   - [ ] Disallow a user from signing in without a name
   - [ ] Allow a user to sign out
   - [ ] Listen to all messages, even when not signed in
   - [ ] Send messages only when signed in
