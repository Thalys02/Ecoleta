import axios from 'axios';

const ibgeApi = axios.create({
    baseURL:'https://servicodados.ibge.gov.br/api/v1/localidades/'

});

export default ibgeApi;