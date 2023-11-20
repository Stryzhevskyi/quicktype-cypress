import { useState } from 'react';
import { useGetPokemon, useGetPokemons } from './api/queries';

export const Pokemons = () => {
    const [pokemonId, setPokemonId] = useState();
    const { data: pokemons, isLoading: pokemonsLoading } = useGetPokemons();
    const { data: pokemon } = useGetPokemon(pokemonId);

    const selectPockemon = (p: any) => {
        const [id] = p.url.split('/').slice(-2, -1);
        setPokemonId(id);
    }

    if (pokemonsLoading) {
        return <>'Loading...'</>;
    }

    return <div>
        {pokemons.map((p: any) => (
                <div key={p.name} test-id={`pokemon-row-${p.name}`}>
                    {p.name}
                    <button
                        onClick={() => selectPockemon(p)}
                        test-id={`pokemon-view-${p.name}`}
                    >View</button>
                </div>
            )
        )}
        {pokemon &&
          <div>
            Height: {pokemon.height}
            Weight: {pokemon.weight}
          </div>}
    </div>
}
