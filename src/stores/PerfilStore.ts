import { defineStore } from 'pinia'
import PerfilService from '../services/PerfilService'
import { PerfilState } from '../models/PerfilState'

export const usePerfilStore= defineStore('PerfilStore', {
    state: (): PerfilState => ({
        idDono: 0,
        nomePerfil: '...',
        usuarioLogado: 0,
        logadoSSO: 0,
        multiLiberado: false,
        permissoes: {},
        listaUsuarios: [],
        usouDiasGratis: false,
        planoAtivo: false,
        carregado: false,
        permiteTabelasPersonalizadas: false,
    }),
    getters: {
        getIdDonoComPerfil():string{
            return this.idDono + ' - ' + this.nomePerfil
        },
        getUsuarios():[]{
            return this.listaUsuarios
        },
        getNomePerfil():string{
            return this.nomePerfil.trim()?.length < 15
                ? this.nomePerfil
                : this.nomePerfil.substring(0, 15) + '...'
        },
        getIdDono():number{
            return this.idDono
        },
        getDiasGratis() :boolean{
            return this.usouDiasGratis
        }
    },
    actions: {
        async getPerfil(caller = '') {
            //log dominio
            console.log('dominio host atual', window.location.host)
            if (this.nomePerfil === '...' && !this.carregado) {
                console.log('store getPerfil chamado:', caller)
                const response = await PerfilService.getPerfil(caller)
                console.log('store getPerfil resposta:', response)
                const resp = response.data as PerfilState
                console.log('store getPerfil dados:', resp)

                this.$patch(resp)

                this.carregado = true
                console.log('store carregado:', this.carregado)
            }

            return true
        },
        reset() {
            this.$reset()
        }
    },
})
