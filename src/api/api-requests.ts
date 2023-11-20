import { axiosClient  } from './axios';

type CancelableRequest = {
    signal?: AbortSignal;
}

type EntityRequest = {
    id?: string;
} & CancelableRequest

export const getPokemon = ({ id, signal }: EntityRequest) => axiosClient.get(`/pokemon/${id}`, { signal })
export const getPokemons = ({ signal }: EntityRequest) => axiosClient.get(`/pokemon`, { signal })
