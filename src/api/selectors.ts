import { AxiosResponse } from 'axios';

export const selectData = (response: AxiosResponse) => response.data;
export const selectResults = (response: AxiosResponse) => response.data.results;
