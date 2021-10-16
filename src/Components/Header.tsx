export function Header({ turn, winner, self, gameOver }: any) {
  return (
    <div className="text-center">
      <h1>Tic Tac Toe</h1>
      <span>Your classic Tic Tac Toe Game</span>
      {winner === -1 ? (
        !gameOver ? (
          <div className="mt-5">
            {turn === self
              ? `Your ${self === 1 ? "(X)" : "(O)"}`
              : `Opponent's ${self === 1 ? "(O)" : "(X)"}`}{" "}
            turn
          </div>
        ) : (
          <div className="mt-5">Draw</div>
        )
      ) : (
        <div className="mt-5">
          Player {winner === 1 ? "X" : "O"} is the Winner{" "}
        </div>
      )}
    </div>
  );
}
