import Cookies from 'js-cookie'
const DOMINIO = import.meta.env.VITE_DOMINIO
export function limpezaCookies(options = {}) {
    const hostname = window.location.hostname

    // Lista de cookies que você quer apagar
    const cookiesToClear = ['c_id_dono', 'c_v_app']

    // Lista de domínios possíveis para remoção dos cookies

    const domains = [DOMINIO, window.location.hostname]

    // Sempre tenta remover sem domínio também (para localhost ou fallback)
    domains.push('')

    cookiesToClear.forEach(cookieName => {
        domains.forEach(domain => {
            const domainPart = domain ? `domain=${domain};` : ''
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; ${domainPart}`
        })
    })

    // Limpa localStorage e sessionStorage
    localStorage.clear()
    sessionStorage.clear()

    domains.forEach(domain => {
        // Cookies.remove("c_id_dono", '/', '.' + domain)
        // Cookies.remove("c_v_app", '/', '.' + domain)
        Cookies.remove('c_id_dono', { path: '/', domain })
        Cookies.remove('c_v_app', { path: '/', domain })
        Cookies.remove('v_id_dono', { path: '/', domain })
        Cookies.remove('v_usuario_logado', { path: '/', domain })
        Cookies.remove('v_nome_perfil', { path: '/', domain })
        Cookies.remove('v_token', { path: '/', domain })
        Cookies.remove('v_timestamp', { path: '/', domain })
        Cookies.remove('v_logado_sso', { path: '/', domain })
        Cookies.remove('v_permissao', { path: '/', domain })
        Cookies.remove('v_multi_liberado', { path: '/', domain })
    })

    console.log('[Cleanup] Cookies e storage limpos')
}
