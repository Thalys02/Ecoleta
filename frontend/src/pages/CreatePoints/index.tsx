import React,{useEffect,useState,ChangeEvent, FormEvent} from 'react';
import {Link,useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi'
import swal from 'sweetalert';


import {Map,TileLayer,Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet'

import api from '../../services/api'
import ibgeApi from '../../services/IBGE_api'

import Dropzone from '../../compoments/Dropzone'

import './styles.css';

import logo from '../../assets/logo.svg';


//array ou objeto: criar interface manualmente informando o tipo da variavel
interface Item{
    id:number,
    title:string,
    image_url:string
}

interface IBGEUFResponse{
    sigla:string;
}

interface IBGECityResponse{
    nome:string;
}


const CreatePoint = () =>{
    // const [items,setItems] = useState<Array<Item>>([]);
    const [items,setItems] = useState<Item[]>([]);
    const [ufs,setUfs] = useState<string[]>([]);
    const [cities,setCities] = useState<string[]>([]);

    const [initialPositon,setInitialPositon] = useState<[number,number]>([0,0]);
    const [inputData,setInputData] = useState({
        name:'',
        email:'',
        whatsapp:'',
    });


    const [selectedUf,setSelectedUf] = useState('0');
    const [selectedCity,setSelectedCity] = useState('0');
    const [selectedItems,setSelectedItems] = useState<number[]>([]);
    const [selectedPosition,setSelectedPosition] = useState<[number,number]>([0,0]);
    const [selectedFile,setSelectedFile] = useState<File>();
    const history = useHistory();

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude,longitude} = position.coords;

            setInitialPositon([latitude,longitude]);
        })
    },[])

    useEffect(()=>{
        api.get('items').then(response => {
            setItems(response.data);
        })
    },[]);

    useEffect(()=>{
        ibgeApi.get<IBGEUFResponse[]>('estados').then(response=>{
        const ufInitials = response.data.map(uf => uf.sigla);
        setUfs(ufInitials);
        })
    },[]);

    useEffect(()=>{
        if(selectedUf === '0'){
            return;
        }
        ibgeApi.get<IBGECityResponse[]>(`estados/${selectedUf}/municipios`)
        .then(response=>{
            const cityNames = response.data.map(city=>city.nome);
            setCities(cityNames);
        });
    },[selectedUf]);

    function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUf(uf);
    }
    
    function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }
    function handleMapClick(event:LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,
        ])
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setInputData({...inputData,[name]:value});
    }
    function handleSelectItem(id:number){
        const alreadySelected = selectedItems.findIndex(item=> item === id)

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems,id]);
        }

    }
    async function  handleSubmit(event:FormEvent){
        event.preventDefault();

        const {name,email,whatsapp} =inputData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude,longitude]=selectedPosition;
        const items = selectedItems;
        
        const data = new FormData();
        
        
            data.append('name',name);
            data.append('email',email);
            data.append('whatsapp',whatsapp);
            data.append('uf',uf);
            data.append('city',city);
            data.append('latitude',String(latitude));
            data.append('longitude',String(longitude));
            data.append('items',items.join(','));
        
            if(selectedFile){
                data.append('image',selectedFile)
            }

        await api.post('points',data);
        swal("Cadastrado!","Ponto de coleta cadastrado com sucesso.","success");
        history.push('/');
    }
    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft/>
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadasto do <br/>ponto de coleta</h1>
                <Dropzone onFileUploaded={setSelectedFile} />
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="Whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="Whatsapp"
                                id="Whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPositon} zoom={14} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    <Marker position={selectedPosition}/>
                        
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUf}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf=>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city"
                                id="uf"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city=>(
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo </span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item =>(
                            <li 
                                key={item.id}
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id)?'selected':''}
                            >
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                       
                        
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;