import { h, app } from 'hyperapp'

/*
 * Board visualization
 * Array of cells, 3x3 = 9
 *
 * First row:   [0, 1, 2]
 * Second row:  [3, 4, 5]
 * Final row:   [6, 7, 8]
 *
 */


const state = { currentPlayer: 'x',
  board: ['', '', '', '', '', '', '', '', ''],
  isDone: false,
  winner: null,
}

const lines = [
  // rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],

  // cols
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],

  // diagonals
  [0, 4, 8],
  [2, 4, 6],
]

const rowColToIndex = (row, col) => (row * 3) + col

const completesLine = (board, player) => (
  lines.some((lineIndexes) => (
    lineIndexes.every((idx) => board[idx] === player)
  ))
)

const actions = {
  place: ({ row, col }) => state => {
    const isAxisValid = i => i >= 0 && i < 3

    if (!isAxisValid(row) || !isAxisValid(col)) return state

    const index = rowColToIndex(row, col)

    const board = state.board
      .slice(0, index)
      .concat(state.currentPlayer)
      .concat(state.board.slice(index + 1))

    const isBoardFull = board.every((c) => c !== '')
    const isWinner = completesLine(board, state.currentPlayer)
    const isDone = isWinner || isBoardFull

    return {
      currentPlayer: state.currentPlayer === 'x' ? 'o' : 'x',
      board: board,
      isDone: isDone,
      winner: isWinner ? state.currentPlayer : null,
    }
  },
  reset: () => () => state
}

const view = (state, actions) => (
  <div>
    <h1>
      Tic Tac Toe
      &nbsp;
      <button onclick={() => actions.reset()}>
        New Game
      </button>
    </h1>
    <h3>
      {!state.isDone && <div>Current player: {state.currentPlayer.toUpperCase()}</div>}
      {state.isDone && state.winner && <div>{state.winner} won!</div>}
      {state.isDone && !state.winner && <div>Cats game!</div>}
    </h3>

    <div>
      {[0, 1, 2].map((row) => (
        <div className="row">
          {[0, 1, 2].map((col) => {
            const value = state.board[rowColToIndex(row, col)]
            const canClick = value === '' && !state.isDone
            const onClick = canClick
              ? () => actions.place({ row, col })
              : () => {}

            return (
              <div
                className="cell"
                onclick={onClick}
                style={{ cursor: canClick ? 'pointer' : 'default' }}
              >
                {value}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  </div>
)

const ticTacToe = app(state, actions, view, document.getElementById('root'))
