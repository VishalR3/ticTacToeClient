import { useEffect, useState } from "react";
import { Header } from "../Components/Header";

import * as Colyseus from "colyseus.js";
// import room, { sendData } from "./connect";

let host = window.document.location.host.replace(/:.*/, "");

let client: any = new Colyseus.Client("ws://" + host + ":2567");
let room: any;

async function connect() {
  room = await client.joinOrCreate("ultimateTicTacToe");
  console.log(room);
}

async function sendData(data: any) {
  room.send("mark", data);
}

connect();

const Box = ({ val }: any) => {
  let boxFill = "";
  if (val === 1) {
    boxFill = "X";
  } else if (val === 2) {
    boxFill = "O";
  } else {
    boxFill = "";
  }
  return (
    <div className="box">
      <span>{boxFill}</span>
    </div>
  );
};

export function Board({
  turn,
  ticTacIndex,
  boardState,
  setBigBoxes,
  self,
}: any) {
  const [boxes, setBoxes] = useState(Array(9).fill(-1));
  const [gameOver, setGameOver] = useState(false);

  const handleClick = async (index: number) => {
    if (!gameOver) {
      if ((turn === 2 && self === 2) || (turn === 1 && self === 1)) {
        // let player = self;
        // boxes[index] = player;
        // setBoxes([...boxes]);
        await sendData(ticTacIndex * 9 + index);
        // } else {
        //   console.log("Not Allowed", self);
      }
    }
  };
  const calculateWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (boxes[a] !== -1 && boxes[a] === boxes[b] && boxes[a] === boxes[c]) {
        return boxes[a];
      }
    }
    return false;
  };
  const isGameOver = () => {
    let win = calculateWinner();
    if (!win) {
      for (let i = 0; i < 9; i++) {
        if (boxes[i] === -1) {
          return false;
        }
      }
    } else {
      boardState[ticTacIndex] = win;
      setBigBoxes([...boardState]);

      let data = {
        player: win,
        boardNo: ticTacIndex,
      };
      room.send("declareWinner", data);
    }
    return true;
  };
  useEffect(() => {
    setTimeout(() => {
      try {
        // room.state.board.onAdd = (player: any, key: any) => {
        //   console.log(player, "added at", key);
        // };
        // room.state.board.onChange = (player: any, key: any) => {
        //   console.log(player, "have changes at ", key);
        // };
        room.onMessage("update", (msg: any) => {
          if (
            msg.index >= ticTacIndex * 9 &&
            msg.index < (ticTacIndex + 1) * 9
          ) {
            console.log("Executed");

            if (ticTacIndex !== 0) {
              boxes[msg.index % (ticTacIndex * 9)] = msg.player;
            } else {
              boxes[msg.index] = msg.player;
            }
            setBoxes([...boxes]);
            setGameOver(isGameOver());
          }
        });
      } catch (e) {
        console.error(e);
      }
    }, 150);
    // eslint-disable-next-line
  }, []);
  return (
    <div className="ticTacBoard">
      <div className="row">
        {boxes.map((box, index) => (
          <div className="col-4" key={index} onClick={() => handleClick(index)}>
            <Box val={box} />
          </div>
        ))}
      </div>
    </div>
  );
}

const BigBoard = ({ turn, setWinner, self, setGameOver }: any) => {
  // eslint-disable-next-line
  const [boxes, setBoxes] = useState(Array(9).fill(-1));

  const calculateWinner = () => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (boxes[a] !== -1 && boxes[a] === boxes[b] && boxes[a] === boxes[c]) {
        return boxes[a];
      }
    }
    return false;
  };
  const isGameOver = () => {
    let win = calculateWinner();
    if (!win) {
      for (let i = 0; i < 9; i++) {
        if (boxes[i] === -1) {
          return false;
        }
      }
    } else {
      setWinner(win);
    }
    return true;
  };
  useEffect(() => {
    setTimeout(() => {
      room.state.ultimateBoard.onChange = (player: number, key: number) => {
        setGameOver(isGameOver());
        console.log(player, "is changed at", key);
      };
    }, 150);
  }, []);
  return (
    <div className="ultimateBoard">
      <div className="row">
        {boxes.map((box, index) => (
          <div className={`col-4`} key={index}>
            <div
              className={box !== -1 ? (box === 1 ? "coverX" : "coverO") : ""}
            ></div>
            <Board
              turn={turn}
              setBigBoxes={setBoxes}
              boardState={boxes}
              ticTacIndex={index}
              self={self}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Ultimate() {
  const [turn, setTurn] = useState(1);
  const [self, setSelf] = useState(1);
  const [winner, setWinner] = useState(-1);
  const [gameOver, setGameOver] = useState(false);
  const [players, setPlayers] = useState<any>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (room) {
        clearInterval(interval);
        room.state.players.onAdd = (player: any) => {
          players.push(player.x);
          setPlayers([...players]);
        };
        room.state.players.onChange = (player: any, key: number) => {
          players[key] = player;
          setPlayers([...players]);
        };
        room.state.players.onRemove = (player: any, key: number) => {
          delete players[key];
          setPlayers([...players]);
        };
        room.onMessage("classify", (data: number) => {
          if (data !== 1) {
            setSelf(2);
          }
        });
        room.state.listen("currentTurn", (currentValue: any) => {
          setTurn(currentValue);
        });
      }
    }, 10);
  }, []);

  return (
    <div className="container">
      <Header turn={turn} winner={winner} self={self} gameOver={gameOver} />
      <div className="centerize">
        {players.length < 2 ? (
          "Waiting For Opponent"
        ) : (
          <BigBoard
            turn={turn}
            setWinner={setWinner}
            self={self}
            setGameOver={setGameOver}
          />
        )}
      </div>
    </div>
  );
}
