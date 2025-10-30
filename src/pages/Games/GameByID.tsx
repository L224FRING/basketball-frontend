import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Game } from "../../types/game";
import { useAuth } from "../../context/AuthContext";
import "./GameByID.css";
import { playersAPI, gamesAPI } from '../../services/api';

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
  const [homePlayers, setHomePlayers] = useState<any[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<any[]>([]);
  const [selectedHomePlayer, setSelectedHomePlayer] = useState<string | null>(null);
  const [selectedAwayPlayer, setSelectedAwayPlayer] = useState<string | null>(null);

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

  // Load players for each team once game is loaded
  useEffect(() => {
    if (!game) return;

    const fetchTeamPlayers = async () => {
      try {
        if (game.homeTeam?._id) {
          const res = await playersAPI.getPlayers({ team: game.homeTeam._id });
          const p = res.data?.data ?? res.data ?? [];
          setHomePlayers(p);
          if (p.length) setSelectedHomePlayer(p[0]._id || p[0].id || null);
        }

        if (game.awayTeam?._id) {
          const res2 = await playersAPI.getPlayers({ team: game.awayTeam._id });
          const a = res2.data?.data ?? res2.data ?? [];
          setAwayPlayers(a);
          if (a.length) setSelectedAwayPlayer(a[0]._id || a[0].id || null);
        }
      } catch (err) {
        console.error('Failed to load team players', err);
      }
    };

    fetchTeamPlayers();
  }, [game]);

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

  const handleScoreEvent = async (team: 'home' | 'away', points: number, playerId: string | null) => {
    if (!game) return;
    if (!playerId) {
      alert('Please select a player who scored');
      return;
    }

    try {
      // Call server endpoint that updates both the game score and gameStats for the player
      const res = await gamesAPI.scoreEvent(game._id, { team, playerId, points });
      const updated = res.data?.data ?? res.data;
      setGame(updated);
    } catch (err: any) {
      console.error('Score event failed', err);
      alert(err.response?.data?.message || 'Failed to record score');
    }
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
              <span className="score-number">{game.homeScore}</span>
            </div>

            {canEdit && (
              <div className="scorer-controls">
                <label className="scorer-label">
                  Scorer:
                  <select className="scorer-select" value={selectedHomePlayer ?? ''} onChange={(e) => setSelectedHomePlayer(e.target.value)}>
                    <option value="">Select player</option>
                    {homePlayers.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>

                <div className="score-buttons">
                  <button onClick={() => handleScoreEvent('home', 3, selectedHomePlayer)}>+3</button>
                  <button onClick={() => handleScoreEvent('home', 2, selectedHomePlayer)}>+2</button>
                  <button onClick={() => handleScoreEvent('home', 1, selectedHomePlayer)}>FT +1</button>
                </div>
              </div>
            )}
          </div>

          <div className="vs-block">VS</div>

          <div className="team-block away-team">
            <h2>{game.awayTeam?.name}</h2>
            <div className="score-row">
              <span className="score-number">{game.awayScore}</span>
            </div>

            {canEdit && (
              <div className="scorer-controls">
                <label className="scorer-label">
                  Scorer:
                  <select className="scorer-select" value={selectedAwayPlayer ?? ''} onChange={(e) => setSelectedAwayPlayer(e.target.value)}>
                    <option value="">Select player</option>
                    {awayPlayers.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>

                <div className="score-buttons">
                  <button onClick={() => handleScoreEvent('away', 3, selectedAwayPlayer)}>+3</button>
                  <button onClick={() => handleScoreEvent('away', 2, selectedAwayPlayer)}>+2</button>
                  <button onClick={() => handleScoreEvent('away', 1, selectedAwayPlayer)}>FT +1</button>
                </div>
              </div>
            )}
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

