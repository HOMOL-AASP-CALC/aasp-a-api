import { Divida } from '@/models/Divida'

export interface Devedor {
    id: number
    nome: string
    cpfCnpj: string
    tipoPessoa: ( 'F' | 'J' )
    telefone: string
    email: string
    dividas: Divida[]
}
