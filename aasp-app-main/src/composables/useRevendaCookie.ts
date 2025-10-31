// src/composables/useRevendaCookie.js
import Cookies from 'js-cookie';

export function setCookieRevenda(r: string, domain: string) {
    const date = new Date();
    date.setDate(date.getDate() + 1); // set the date to 1 day in the future

    console.log('urlDebit: ', domain);

    const cookieOptions = {
        domain: "." + domain,
        expires: date
    };

    //limpar cookie c_v_r caso existe
    Cookies.remove("c_v_r", cookieOptions);

    Cookies.set("c_v_r", r, cookieOptions);

    return Cookies.get("c_v_r");
}

export function getCookieRevenda() {
    const cookie = Cookies.get("c_v_r") || '';
    console.log('cookie: ', cookie);
    return cookie;
}
