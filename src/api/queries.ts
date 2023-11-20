import { useQuery } from 'react-query';
import { getPokemon, getPokemons } from './api-requests';
import { pokemonKeys } from './keys';
import { selectData, selectResults } from './selectors';

export const useGetPokemons = () => {
    return useQuery({
        queryKey: pokemonKeys.pokemons(),
        queryFn: ({ signal }) => getPokemons({ signal }),
        select: selectResults,
    });
}

export const useGetPokemon = (id?: string) => {
    return useQuery({
        queryKey: pokemonKeys.pokemon(id),
        queryFn: ({ signal }) => getPokemon({ id, signal }),
        enabled: !!id,
        select: selectData,
    });
}
