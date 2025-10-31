//exportar default to validaEmail
export default function validaEmail(email) {
    const emailPattern = /^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i;
    console.log('validando...: '+email)
    return emailPattern.test(email);
}
