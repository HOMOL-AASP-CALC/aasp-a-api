import axios from 'axios'
import api from "@/plugins/axios";

const apiClient = api.create({
    baseURL: `${import.meta.env.VITE_API_URL}/lista/`,
    withCredentials: true,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
})


export default {
    async getPerfil(caller = '') {
        console.log(`[PerfilService] getPerfil called by: ${caller}`)
        const r = api.get('/menu/perfil')
        console.log('r =>', r)
        return r
	
    },
}
