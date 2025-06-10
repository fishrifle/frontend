import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

const API_URL = "http://localhost:5000/api";

const BattleArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedPokemon } = location.state || {};
  const [diceRoll, setDiceRoll] = useState([null, null]);
  const [winner, setWinner] = useState(null);
  const [phase, setPhase] = useState("roll");
const [rolled, setRolled] = useState([false,false]);
 
useEffect(() => {
    if (!selectedPokemon || selectedPokemon.length !== 2) {
      navigate('/');
    }
  }, [selectedPokemon, navigate]);

  const handleDiceRoll = (index) => {
    const newRoll = Math.ceil(Math.random() * 6);
    const updatedRolls = [...diceRoll];
    const updatedRolled = [...rolled];

    updatedRolls[index] = newRoll;
    updatedRolled[index] = true;

    setDiceRoll(updatedRolls);
    setRolled(updatedRolled);

    // Once both are rolled, check if we have a winner or need to reroll
    if (updatedRolled.every((r) => r)) {
      if (updatedRolls[0] === updatedRolls[1]) {
        // tie - reset and force re-roll
        alert("It's a tie! Roll again.");
        setDiceRoll([null, null]);
        setRolled([false, false]);
      } else {
        setPhase("result");
      }
    }
  };
  
  const rollUntilWinner = () => {
    let roll1 = 0;
    let roll2 = 0;
    let attempts = 0;

    do {
      roll1 = Math.ceil(Math.random() * 6);
      roll2 = Math.ceil(Math.random() * 6);
      attempts++;
    } while (roll1 === roll2 && attempts < 100);

    setDiceRoll([roll1, roll2]);
    setPhase("result");
  };

  const calculateWinner = () => {
    const [pokemon1, pokemon2] = selectedPokemon;
    const totalPower1 = pokemon1.stats.hp + pokemon1.stats.attack + diceRoll[0];
    const totalPower2 = pokemon2.stats.hp + pokemon2.stats.attack + diceRoll[1];

    console.log("⚔️ Battle between:", pokemon1.name, "vs", pokemon2.name);
    const winner = totalPower1 > totalPower2 ? pokemon1 : pokemon2;
    console.log("🏆 Winner is:", winner.name);
    setWinner(winner);

    if (winner) {
      axios.post(`${API_URL}/battleresults`, {
        selectedPokemon: [
          { _id: pokemon1._id, name: pokemon1.name },
          { _id: pokemon2._id, name: pokemon2.name },
        ],
        battleResult: `${winner.name} wins`,
      })
        .then(() => console.log("✅ Battle result saved"))
        .catch((err) => console.error("❌ Error saving battle result:", err));

      setTimeout(() => navigate("/"), 5000);
    }
  };

  useEffect(() => {
    if (phase === "result" && diceRoll[0] && diceRoll[1]) {
      calculateWinner();
    }
  }, [phase, diceRoll]);

  if (!selectedPokemon || selectedPokemon.length !== 2) {
    return <p>Loading...</p>;
  }

  return (
    <div className="battle-arena">
      <h1>Battle Arena</h1>
      <div className="arena">
        <div className="pokemon-card-left">
          <h3>{selectedPokemon[0].name}</h3>
          <img src={selectedPokemon[0].sprites.front_default} alt={selectedPokemon[0].name} />
        </div>
        <div className="dice-images">
          {[0, 1].map((i) => (
            <div key={i} onClick={() => handleDiceRoll(i)} className="clickable-die">
              <p>{selectedPokemon[i].name} {rolled[i] ? "rolled:" : "click to roll"}</p>
              {diceRoll[i] ? (
                <img
                  src={`/dice/dice${diceRoll[i]}.png`}
                  alt={`Dice ${diceRoll[i]}`}
                />
              ) : (
                <div className="dice-placeholder">🎲</div>
              )}
            </div>
          ))}
        </div>

        <div className="pokemon-card-right">
          <h3>{selectedPokemon[1].name}</h3>
          <img src={selectedPokemon[1].sprites.front_default} alt={selectedPokemon[1].name} />
        </div>
      </div>
      {winner && <h2 className="winner">{winner.name} Wins!</h2>}
    </div>
  );
};

export default BattleArena;
