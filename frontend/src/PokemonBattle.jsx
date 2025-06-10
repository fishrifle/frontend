import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

const PokemonBattle = () => {
  const [allPokemon, setAllPokemon] = useState([]);
  const [selectedPokemon, setSelectedPokemon] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon?limit=252")
      .then(async (res) => {
        const basicList = res.data.results;

        const detailed = await Promise.all(
          basicList.map(async (p) => {
            const { data } = await axios.get(p.url);
            return {
              _id: data.id, // using id from API
              name: data.name,
              sprites: {
                front_default: data.sprites.front_default,
              },
              stats: {
                hp: data.stats[0]?.base_stat || 50,
                attack: data.stats[1]?.base_stat || 50,
                defense: data.stats[2]?.base_stat || 50,
                speed: data.stats[5]?.base_stat || 50,
              },
              type: data.types.map((t) => t.type.name),
              battles: [],
              battleStats: { wins: 0, loses: 0 },
            };
          })
        );

        setAllPokemon(detailed);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Pokémon:", err);
        setError("Failed to load Pokémon.");
        setLoading(false);
        console.log("Fetched Pokémon:", detailed);
      });
  }, []);

  const toggleSelect = (e, pokemon) => {
    e.preventDefault();
    setSelectedPokemon((prev) => {
      const exists = prev.some((p) => p._id === pokemon._id);
      if (exists) return prev.filter((p) => p._id !== pokemon._id);
      if (prev.length >= 2) return prev;
      return [...prev, pokemon];
    });
  };
  console.log(import.meta.env.VITE_API_URL);

  const toggleFlip = (e, id) => {
    e.preventDefault();
    setFlippedCards((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const startBattle = () => {
    if (selectedPokemon.length !== 2) {
      alert("Select two Pokémon to battle!");
      return;
    }
    navigate("/battle", { state: { selectedPokemon } });
  };

  if (loading) return <p>Loading Pokémon…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Let The Best Pokémon Win</h1>

      <div className="pokemon-list">
        {allPokemon.map((pokemon) => {
          const isSelected = selectedPokemon.some((p) => p._id === pokemon._id);
          const isFlipped = flippedCards.includes(pokemon._id);
          const primaryType = pokemon.type?.[0] || "normal";

          return (
            <div
              key={pokemon._id}
              className={`pokemon-card type-${primaryType} ${isSelected ? "selected" : ""
                } ${isFlipped ? "flipped" : ""}`}
              onClick={(e) => toggleSelect(e, pokemon)}
              onContextMenu={(e) => toggleFlip(e, pokemon._id)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <h3>{pokemon.name}</h3>
                  <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                  <div className="pokemon-stats">
                    <p>Types: {pokemon.type.join(", ")}</p>
                    <p>HP: {pokemon.stats.hp}</p>
                    <p>Atk: {pokemon.stats.attack}</p>
                    <p>Def: {pokemon.stats.defense}</p>
                    <p>Spd: {pokemon.stats.speed}</p>
                  </div>
                </div>

                <div className="card-back">
                  <p>{`${pokemon.name} has fought ${pokemon.battles.length} battles.`}</p>
                  <p>{`Record: ${pokemon.battleStats.wins} wins, ${pokemon.battleStats.loses} losses.`}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="battle-controls">
        <button
          className="battle-button"
          onClick={startBattle}
          disabled={selectedPokemon.length !== 2}
        >
          Start Battle
        </button>
      </div>
    </div>
  );
};

export default PokemonBattle;

