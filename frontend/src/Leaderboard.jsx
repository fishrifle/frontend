import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000";

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        axios.get(`${API_URL}/api/leaderboard`)
            .then(res => setLeaders(res.data))
            .catch(err => console.error("Error fetching leaderboard", err));
    }, []);

    return (
        <div>
            <h2>🏆 Top 10 Pokémon</h2>
            <ul>
                {leaders.map((poke, i) => (
                    <li key={poke._id}>
                        #{i + 1} — {poke.name} ({poke.battleStats?.wins || 0} wins)
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Leaderboard;
