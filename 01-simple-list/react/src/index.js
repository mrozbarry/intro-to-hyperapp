import React, { Component } from 'react'
import { render } from 'react-dom'

class List extends Component {
  constructor (props) {
    super(props)

    this.state = {
      items: [],
      text: ''
    }
  }

  handleKeyDown (e) {
    if (e.which === 13) {
      e.preventDefault()

      this.setState({
        text: '',
        items: this.state.items.concat(this.state.text),
      })
    }
  }

  render () {
    const { items, text } = this.state

    return (
      <ul>
        {items.map((item, idx) => <li key={idx}>{item}</li>)}
        <li key="text">
          <input
            type="text"
            placeholder="Add a new item to the list"
            value={text}
            onChange={(e) => this.setState({ text: e.target.value }) }
            onKeyDown={this.handleKeyDown.bind(this)}
          />
        </li>
      </ul>
    )
  }
}

render(<List />, document.getElementById('root'))
