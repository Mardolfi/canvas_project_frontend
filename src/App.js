import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { io } from "socket.io-client";

function App() {
  const [user, setUser] = useState("");
  const telaRef = useRef(null);
  const contextRef = useRef(null);

  useEffect(() => {
    const tela = telaRef.current;
    tela.width = 500;
    tela.height = 500;

    const context = tela.getContext("2d");
    contextRef.current = context;
  }, []);

  let socket = io(process.env.REACT_APP_SOCKET_URL);

  socket.on("updatePlayers", (updatePlayers) => {
    const objective = updatePlayers.find((player) => player.name == "objective");
    if (objective) {
      updatePlayers
        .filter((player) => player.name !== "objective")
        .forEach((player) => {
          if (
            player.position.x == objective.position.x &&
            player.position.y == objective.position.y
          ) {
            socket.emit('playerPoint')
          }
        });
    }
  
    contextRef.current.clearRect(0, 0, telaRef.current.width, telaRef.current.height);
    updatePlayers.forEach((player) => {
      const playerUpdate = new Player({
        x: player.position.x,
        y: player.position.y,
      });
  
      playerUpdate.draw();
    });
  });

  class Player {
    constructor(position) {
      this.position = position;
    }

    draw() {
      contextRef.current.fillRect(this.position.x, this.position.y, 10, 10);
    }

    toTop() {
      if (this.position.y > 0) {
        this.position.y = this.position.y - 10;
        socket.emit("movePlayer", {
          name: user,
          position: this.position,
        });
      }
    }
    toBottom() {
      if (this.position.y < 490) {
        this.position.y = this.position.y + 10;
        socket.emit("movePlayer", {
          name: user,
          position: this.position,
        });
      }
    }
    toRight() {
      if (this.position.x < 490) {
        this.position.x = this.position.x + 10;
        socket.emit("movePlayer", {
          name: user,
          position: this.position,
        });
      }
    }
    toLeft() {
      if (this.position.x > 0) {
        this.position.x = this.position.x - 10;
        socket.emit("movePlayer", {
          name: user,
          position: this.position,
        });
      }
    }
  }

  const player = new Player({
    y: Math.ceil((Math.random() * 490) / 10) * 10,
    x: Math.ceil((Math.random() * 490) / 10) * 10,
  });

  function newPlayer(e) {
    if (user !== "") {
      e.preventDefault();

      socket.emit("newPlayer", {
        name: user,
        position: player.position,
      });

      window.addEventListener("keypress", (e) => {
        switch (e.key) {
          case "w":
            player.toTop();
            break;
          case "s":
            player.toBottom();
            break;
          case "d":
            player.toRight();
            break;
          case "a":
            player.toLeft();
            break;

          default:
            break;
        }
      });
    }
  }

  return (
    <Container>
      <h1>Multiplayer Game</h1>
      <Tela id="tela" ref={telaRef}></Tela>
      <form onSubmit={newPlayer}>
        <input
          type="text"
          placeholder="User"
          id="user"
          onChange={(e) => setUser(e.target.value)}
        />
        <button id="new-player">Enter</button>
      </form>
    </Container>
  );
}

const Tela = styled.canvas`
  width: 500px;
  height: 500px;
  border: 1px solid black;
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 100vh;
  gap: 10px;
`;

export default App;
