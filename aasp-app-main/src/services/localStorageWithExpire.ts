export function localStorageExpires()
{
    const toRemove = [],                      // Itens para serem removidos
        currentDate = new Date().getTime(); // Data atual em milissegundos

    for (let i = 0, j = localStorage.length; i < j; i++) {
        const key = localStorage.key(i) || "",
            value = localStorage.getItem(key);
        // Verifica se o formato do item para evitar conflitar com outras aplicações
        if (value && value[0] === "{" && value.slice(-1) === "}") {
            // Decodifica de volta para JSON
            const current = JSON.parse(value);
            // Checa a chave expires do item especifico se for mais antigo que a data atual ele salva no array
            if (current.expires && current.expires <= currentDate) {
                toRemove.push(key);
            }
        }
    }
    // Remove itens que já passaram do tempo
    for (let i = toRemove.length - 1; i >= 0; i--) {
        localStorage.removeItem(toRemove[i]);
    }
}
//Função para adicionar itens no localStorage
export function setLocalStorageWithExpire(chave: string, valor: string, minutos: number)
{
    const expirarem = new Date().getTime() + (60000 * minutos);

    localStorage.setItem(chave, JSON.stringify({
        "value": valor,
        "expires": expirarem
    }));
}
//Função para obter itens do localStorage que ainda não expiraram
export function getLocalStorage(chave: string)
{
    localStorageExpires();//Limpa itens

    const value = localStorage.getItem(chave);

    if (value && value[0] === "{" && value.slice(-1) === "}") {

        // Decodifica de volta para JSON
        const current = JSON.parse(value);

        return current.value;
    }
}
