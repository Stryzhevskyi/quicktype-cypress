import axios from 'axios';

export const axiosClient = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
});
