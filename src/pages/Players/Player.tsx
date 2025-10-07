import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { playersAPI } from "../../services/api"
import { Player } from "../../types/player"
import "./PlayerByID.css"

const PlayerByID: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchPlayer(id)
  }, [id])

  const fetchPlayer = async (id: string | undefined) => {
    if (!id) return
    try {
      const response = await playersAPI.getPlayer(id)
      setPlayer(response.data.data)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return <div className="player-center">Loading player...</div>

  if (error || !player)
    return <div className="player-center error">Error getting player</div>

  return (
    <div className="player-page">
      <div className="player-card">
        {/* Header */}
        <div className="player-header">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              player.name
            )}&background=random`}
            alt={player.name}
            className="player-avatar"
          />
          <div className="player-info">
            <h1 className="player-name">{player.name}</h1>
            <p className="player-position">{player.position}</p>
            <p><strong>Team:</strong> {player.team?.name || "Unknown"}</p>
            <p><strong>Jersey #:</strong> {player.jerseyNumber}</p>
            <p><strong>Age:</strong> {player.age} years</p>
          </div>
        </div>

        {/* Stats */}
        <h2 className="stats-title">Player Stats</h2>
        <div className="player-stats">
          {Object.entries(player.stats).map(([key, value]) => (
            <div key={key} className="stat-box">
              <p className="stat-key">
                {key.replace(/([A-Z])/g, " $1")}
              </p>
              <p className="stat-value">{value}</p>
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="player-status">
          <span className={`status-badge ${player.isActive ? "active" : "inactive"}`}>
            {player.isActive ? "Active Player" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PlayerByID

