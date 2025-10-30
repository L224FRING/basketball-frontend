import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Game } from "../../types/game";
import { useAuth } from "../../context/AuthContext";
import "./GameByID.css";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

const GameByID: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [game, setGame] = useState<Game | null>(null);
  const [connected, setConnected] = useState(false);
  const [viewerCount, setViewerCount] = useState<number>(0);

  const canEdit = user?.role === "admin" || user?.role === "coach";

  useEffect(() => {
    if (!id) return;

    socket.emit("joinGame", id);

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("gameUpdated", (updatedGame: Game) => setGame(updatedGame));
    socket.on("viewerCountUpdated", (count: number) => setViewerCount(count));


    fetch(`http://localhost:5000/api/games/${id}`)
      .then((res) => res.json())
      .then((data) => setGame(data.data || data));

    return () => {
      socket.off("gameUpdated");
      socket.off("viewerCountUpdated");
      socket.emit("leaveGame", id);
    };
  }, [id]);

  const handleScoreChange = (team: "home" | "away", delta: number) => {
    if (!game) return;

    const updatedGame = {
      ...game,
      homeScore: team === "home" ? game.homeScore + delta : game.homeScore,
      awayScore: team === "away" ? game.awayScore + delta : game.awayScore,
    };

    setGame(updatedGame);
    socket.emit("updateGame", {
      gameId: game._id,
      homeScore: updatedGame.homeScore,
      awayScore: updatedGame.awayScore,
      status: updatedGame.status,
    });
  };

  const handleDisconnect = () => {
    navigate("/games");
  };

  const handleEndGame = () => {
    if (!game) return;
    const updatedGame = { ...game, status: "completed" };
    setGame(updatedGame);
    socket.emit("updateGame", {
      gameId: game._id,
      homeScore: updatedGame.homeScore,
      awayScore: updatedGame.awayScore,
      status: updatedGame.status,
    });
  };

  if (!game) {
    return (
      <div className="live-container">
        <h2>Loading live game...</h2>
        <p>{connected ? "Connected ⚡" : "Connecting..."}</p>
      </div>
    );
  }

  return (
    <div className="live-container">
      <div className="scoreboard">
        <h1 className="game-title">🏀 {game.homeTeam?.name} vs {game.awayTeam?.name}</h1>
        <p className="viewer-count">👀 {viewerCount} watching live</p>

        <div className="score-row-container">
          <div className="team-block home-team">
            <h2>{game.homeTeam?.name}</h2>
            <div className="score-row">
              {canEdit && <button onClick={() => handleScoreChange("home", -1)}>-</button>}
              <span className="score-number">{game.homeScore}</span>
              {canEdit && <button onClick={() => handleScoreChange("home", +1)}>+</button>}
            </div>
          </div>

          <div className="vs-block">VS</div>

          <div className="team-block away-team">
            <h2>{game.awayTeam?.name}</h2>
            <div className="score-row">
              {canEdit && <button onClick={() => handleScoreChange("away", -1)}>-</button>}
              <span className="score-number">{game.awayScore}</span>
              {canEdit && <button onClick={() => handleScoreChange("away", +1)}>+</button>}
            </div>
          </div>
        </div>

        <p className="status">
          Status: <strong>{game.status || "Not started"}</strong>
        </p>
        <p className="venue">📍 {game.venue}</p>
        <p className="date">🗓️ {new Date(game.gameDate).toLocaleString()}</p>


        <div className="actions">
          <button className="btn disconnect" onClick={handleDisconnect}>Disconnect</button>
          {canEdit && game.status !== "completed" && (
            <button className="btn end-game" onClick={handleEndGame}>End Game</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameByID;

