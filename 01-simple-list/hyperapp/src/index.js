import { h, app } from 'hyperapp'

const state = {
  items: [],
  text: '',
}

const actions = {
  addItem: item => state => ({ text: '', items: state.items.concat(item) }),
  setText: value => state => ({ items: state.items, text: value })
}

const Thing = (props) => {
  return (
    <div onclick={props.onclick}>Hey, this is a thing</div>
  );
};

const view = (state, actions) => {
  return (
    <div>
      <ul>
        {state.items.map((item, idx) => <li key={idx}>{item}</li>)}
        <li key="text">
          <input
            type="text"
            value={state.text}
            oninput={(e) => actions.setText(e.target.value)}
            onkeydown={(e) => {
              if (e.which === 13) {
                e.preventDefault()
                actions.addItem(state.text)
              }
            }}
          />
        </li>
      </ul>
      <Thing onclick={() => alert('hey')} />
    </div>
  )
}

const main = app(state, actions, view, document.getElementById('root'))
