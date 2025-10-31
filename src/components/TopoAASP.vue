<template>
    <div class="mdl-layout__header mdl-color--grey-200 is-casting-shadow" style="margin-bottom: 0px;">
        <div style="height: 85px; padding:5px 60px 0px 20px;" class="row-logo mdl-layout__header-row mdl-color--grey-200">
            <img class="img-logo" src='@/assets/img/logo-aasp.svg' width='120px'>
            <div class="mdl-layout-spacer"></div>

            <div class="dropdown aasp-header-login">
                <span>
                <div class="botao-account">
                    <img xrc="/images/icon-login-aasp.svg" src='@/assets/img/icon-login-aasp.svg' >
                </div>
                </span>
                <span id="botao-menu" class="dropbtn header-login">
                    Olá,
                    <i class="material-icons mdl-color-text--red-700">expand_more</i>
                </span>
                <div id="account-menu" for="botao-menu" class="card card-3 dropdown-content box">
                    <div class="box-head mdl-color-text--red-700 mdl-color--grey-200">
                        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"
                             class="collapsed">
                            <circle cx="22" cy="22" r="22" fill="#1F1F1F" class="collapsed"></circle>
                            <path d="M22 12.8333C21.0935 12.8333 20.2074 13.1021 19.4536 13.6057C18.6999 14.1093 18.1125 14.8251 17.7656 15.6626C17.4187 16.5001 17.3279 17.4217 17.5047 18.3107C17.6816 19.1998 18.1181 20.0165 18.7591 20.6575C19.4001 21.2985 20.2168 21.735 21.1058 21.9119C21.9949 22.0887 22.9165 21.9979 23.754 21.651C24.5915 21.3041 25.3073 20.7167 25.8109 19.9629C26.3145 19.2092 26.5833 18.3231 26.5833 17.4166C26.5833 16.201 26.1004 15.0352 25.2409 14.1757C24.3814 13.3161 23.2156 12.8333 22 12.8333ZM22 20.1666C21.4561 20.1666 20.9244 20.0053 20.4722 19.7031C20.0199 19.401 19.6675 18.9715 19.4593 18.469C19.2512 17.9665 19.1967 17.4135 19.3028 16.8801C19.4089 16.3466 19.6709 15.8566 20.0555 15.472C20.4401 15.0874 20.9301 14.8255 21.4635 14.7194C21.9969 14.6133 22.5499 14.6678 23.0524 14.8759C23.5549 15.0841 23.9844 15.4365 24.2865 15.8888C24.5887 16.341 24.75 16.8727 24.75 17.4166C24.75 18.1459 24.4603 18.8454 23.9445 19.3611C23.4288 19.8769 22.7293 20.1666 22 20.1666ZM30.25 30.2499V29.3333C30.25 27.6314 29.574 25.9993 28.3706 24.796C27.1672 23.5926 25.5351 22.9166 23.8333 22.9166H20.1667C18.4649 22.9166 16.8328 23.5926 15.6294 24.796C14.426 25.9993 13.75 27.6314 13.75 29.3333V30.2499H15.5833V29.3333C15.5833 28.1177 16.0662 26.9519 16.9258 26.0923C17.7853 25.2328 18.9511 24.7499 20.1667 24.7499H23.8333C25.0489 24.7499 26.2147 25.2328 27.0742 26.0923C27.9338 26.9519 28.4167 28.1177 28.4167 29.3333V30.2499H30.25Z"
                                  fill="white"></path>
                        </svg>
                        <div class="box-user" style="text-align: left;">
                            <span class="numero-usuario-logado">
                                        Número AASP:<br />{{  perfilStore.getNomePerfil }}
                                    </span>
                        </div>
                    </div>
                    <ul>
                        <a href="https://www.aasp.org.br/minha-conta" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <svg width="16" height="17" viewBox="0 0 16 17" fill="none"
                                     xmlns="http://www.w3.org/2000/svg" class="collapsed">
                                    <path d="M8 0C7.12097 0 6.26168 0.262377 5.5308 0.753952C4.79991 1.24553 4.23026 1.94422 3.89387 2.76168C3.55748 3.57914 3.46946 4.47865 3.64095 5.34646C3.81244 6.21427 4.23574 7.0114 4.8573 7.63706C5.47887 8.26271 6.27079 8.68879 7.13293 8.86141C7.99507 9.03403 8.8887 8.94543 9.70082 8.60683C10.5129 8.26823 11.2071 7.69482 11.6954 6.95913C12.1838 6.22344 12.4444 5.3585 12.4444 4.47368C12.4444 3.28719 11.9762 2.14929 11.1427 1.31031C10.3092 0.471333 9.17874 0 8 0ZM8 7.15789C7.47258 7.15789 6.95701 7.00047 6.51848 6.70552C6.07995 6.41058 5.73815 5.99136 5.53632 5.50089C5.33449 5.01041 5.28168 4.47071 5.38457 3.95002C5.48747 3.42933 5.74144 2.95105 6.11438 2.57566C6.48732 2.20027 6.96248 1.94462 7.47976 1.84105C7.99704 1.73748 8.53322 1.79064 9.02049 1.9938C9.50776 2.19696 9.92424 2.541 10.2173 2.98242C10.5103 3.42383 10.6667 3.9428 10.6667 4.47368C10.6667 5.18558 10.3857 5.86832 9.88562 6.37171C9.38552 6.87509 8.70724 7.15789 8 7.15789ZM16 17V16.1053C16 14.4442 15.3444 12.8511 14.1776 11.6765C13.0107 10.502 11.428 9.8421 9.77778 9.8421H6.22222C4.57199 9.8421 2.98934 10.502 1.82245 11.6765C0.655554 12.8511 0 14.4442 0 16.1053V17H1.77778V16.1053C1.77778 14.9188 2.24603 13.7809 3.07953 12.9419C3.91302 12.1029 5.04348 11.6316 6.22222 11.6316H9.77778C10.9565 11.6316 12.087 12.1029 12.9205 12.9419C13.754 13.7809 14.2222 14.9188 14.2222 16.1053V17H16Z"
                                          fill="#D9001A"></path>
                                </svg>
                                Minha Conta
                            </span>
                            </li>
                        </a>
                        <a :href="urlApp+`/menu/editar-logotipo`" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <i style="margin-left: -4px" class="material-icons mdl-color-text--red-700">add_photo_alternate</i>
                                Meu Logotipo
                            </span>
                            </li>
                        </a>
                        <a :href="urlApp+`/menu/suporte-lista`" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <i style="margin-left: -4px" class="material-icons mdl-color-text--red-700">question_answer</i>
                                Suporte
                            </span>
                            </li>
                        </a>

                        <a href="https://aaspgerenciador.aasp.org.br/intimacoes" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <svg width="16" height="23" viewBox="0 0 16 23" fill="none"
                                     xmlns="http://www.w3.org/2000/svg" class="collapsed">
                                    <path d="M15.76 5.99643L10.16 0.246429C10 0.0821428 9.84 0 9.6 0H1.6C0.72 0 0 0.739286 0 1.64286V21.3571C0 22.2607 0.72 23 1.6 23H14.4C15.28 23 16 22.2607 16 21.3571V6.57143C16 6.325 15.92 6.16071 15.76 5.99643ZM9.6 1.97143L14.08 6.57143H9.6V1.97143ZM14.4 21.3571H1.6V1.64286H8V6.57143C8 7.475 8.72 8.21429 9.6 8.21429H14.4V21.3571Z"
                                          fill="#D9001A" class="collapsed"></path>
                                    <path d="M3.2 16.4286H12.8V18.0714H3.2V16.4286Z" fill="#D9001A"></path>
                                    <path d="M3.2 11.5H12.8V13.1429H3.2V11.5Z" fill="#D9001A"></path>
                                </svg>
                                Intimações
                            </span>
                            </li>
                        </a>
                        <a href="https://aaspgerenciador.aasp.org.br" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <svg width="20" height="18" viewBox="0 0 20 18" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 1H20C20 0.447715 19.5523 0 19 0V1ZM1 1V0C0.447715 0 0 0.447715 0 1L1 1ZM1 6.05263H0C0 6.60492 0.447715 7.05263 1 7.05263L1 6.05263ZM19 6.05263V7.05263C19.5523 7.05263 20 6.60492 20 6.05263H19ZM0.313086 15.4438C-0.0882808 15.8232 -0.106111 16.4561 0.273261 16.8574C0.652634 17.2588 1.28555 17.2766 1.68691 16.8973L0.313086 15.4438ZM6.4792 10.9916L7.14651 10.2468C6.75911 9.89969 6.1703 9.90754 5.79229 10.2648L6.4792 10.9916ZM9.43975 13.6442L8.77244 14.389C9.15816 14.7346 9.74393 14.7285 10.1224 14.375L9.43975 13.6442ZM13.0591 10.2632L13.7331 9.52439C13.3479 9.17302 12.7574 9.17651 12.3765 9.5324L13.0591 10.2632ZM14.4011 12.8411C14.8091 13.2133 15.4416 13.1843 15.8139 12.7763C16.1861 12.3683 16.1571 11.7358 15.7491 11.3636L14.4011 12.8411ZM20 5.704C20 5.15172 19.5523 4.704 19 4.704C18.4477 4.704 18 5.15172 18 5.704H20ZM18 16.6514C18 17.2037 18.4477 17.6514 19 17.6514C19.5523 17.6514 20 17.2037 20 16.6514H18ZM2 5.704C2 5.15172 1.55228 4.704 1 4.704C0.447715 4.704 0 5.15172 0 5.704H2ZM0 11.5987C0 12.151 0.447715 12.5987 1 12.5987C1.55228 12.5987 2 12.151 2 11.5987H0ZM5.0572 16C4.50491 16 4.0572 16.4477 4.0572 17C4.0572 17.5523 4.50491 18 5.0572 18V16ZM19 18C19.5523 18 20 17.5523 20 17C20 16.4477 19.5523 16 19 16V18ZM6.85 2.52632C6.29772 2.52632 5.85 2.97403 5.85 3.52632C5.85 4.0786 6.29772 4.52632 6.85 4.52632V2.52632ZM16.3 4.52632C16.8523 4.52632 17.3 4.0786 17.3 3.52632C17.3 2.97403 16.8523 2.52632 16.3 2.52632V4.52632ZM3.7 2.52505C3.14772 2.52505 2.7 2.97277 2.7 3.52505C2.7 4.07734 3.14772 4.52505 3.7 4.52505V2.52505ZM4.15 4.52505C4.70228 4.52505 5.15 4.07734 5.15 3.52505C5.15 2.97277 4.70228 2.52505 4.15 2.52505V4.52505ZM19 0H1V2H19V0ZM0 1V6.05263H2V1H0ZM1 7.05263H19V5.05263H1V7.05263ZM20 6.05263V1H18V6.05263H20ZM1.68691 16.8973L7.16611 11.7183L5.79229 10.2648L0.313086 15.4438L1.68691 16.8973ZM5.81189 11.7364L8.77244 14.389L10.1071 12.8994L7.14651 10.2468L5.81189 11.7364ZM10.1224 14.375L13.7417 10.9939L12.3765 9.5324L8.75711 12.9135L10.1224 14.375ZM12.3851 11.0019L14.4011 12.8411L15.7491 11.3636L13.7331 9.52439L12.3851 11.0019ZM18 5.704V16.6514H20V5.704H18ZM0 5.704V11.5987H2V5.704H0ZM5.0572 18H19V16H5.0572V18ZM6.85 4.52632H16.3V2.52632H6.85V4.52632ZM3.7 4.52505H4.15V2.52505H3.7V4.52505Z"
                                          fill="#D9001A"></path>
                                </svg>
                                AASP Gerenciador
                            </span>
                            </li>
                        </a>
                        <a href="https://aplicacao.aasp.org.br/aasp/login/webmail.asp" class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <svg width="20" height="16" viewBox="0 0 20 16" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 0H2C0.9 0 0.00999999 0.9 0.00999999 2L0 14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 14H2V4L10 9L18 4V14ZM10 7L2 2H18L10 7Z"
                                          fill="#D9001A"></path>
                                </svg>
                                Webmail
                            </span>
                            </li>
                        </a>
                        <RouterLink to='/aasp/aasp-logout' class="link2">
                            <li class="mdl-list__item">
                            <span class="mdl-list__item-primary-content">
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
                                     xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3.00004 0C2.20438 0 1.44131 0.316071 0.87869 0.87868C0.316074 1.44129 0 2.20435 0 3V15C0 15.7956 0.316074 16.5587 0.87869 17.1213C1.44131 17.6839 2.20438 18 3.00004 18H8.0001C8.26532 18 8.51967 17.8946 8.70721 17.7071C8.89475 17.5196 9.00011 17.2652 9.00011 17C9.00011 16.7348 8.89475 16.4804 8.70721 16.2929C8.51967 16.1054 8.26532 16 8.0001 16H3.00004C2.73482 16 2.48046 15.8946 2.29292 15.7071C2.10538 15.5196 2.00002 15.2652 2.00002 15V3C2.00002 2.73478 2.10538 2.48043 2.29292 2.29289C2.48046 2.10536 2.73482 2 3.00004 2H8.0001C8.26532 2 8.51967 1.89464 8.70721 1.70711C8.89475 1.51957 9.00011 1.26522 9.00011 1C9.00011 0.734784 8.89475 0.48043 8.70721 0.292893C8.51967 0.105357 8.26532 0 8.0001 0H3.00004Z"
                                          fill="#D9001A"></path>
                                    <path d="M12.2931 4.293C12.4807 4.10553 12.735 4.00021 13.0002 4.00021C13.2653 4.00021 13.5196 4.10553 13.7072 4.293L17.7072 8.293C17.8947 8.48053 18 8.73484 18 9C18 9.26516 17.8947 9.51947 17.7072 9.707L13.7072 13.707C13.5186 13.8892 13.266 13.99 13.0038 13.9877C12.7416 13.9854 12.4907 13.8802 12.3053 13.6948C12.1199 13.5094 12.0147 13.2586 12.0125 12.9964C12.0102 12.7342 12.111 12.4816 12.2931 12.293L14.5862 10H7.00008C6.73486 10 6.48051 9.89464 6.29297 9.70711C6.10543 9.51957 6.00007 9.26522 6.00007 9C6.00007 8.73478 6.10543 8.48043 6.29297 8.29289C6.48051 8.10536 6.73486 8 7.00008 8H14.5862L12.2931 5.707C12.1057 5.51947 12.0004 5.26516 12.0004 5C12.0004 4.73484 12.1057 4.48053 12.2931 4.293Z"
                                          fill="#D9001A"></path>
                                </svg>
                                Sair
                            </span>
                            </li>
                        </RouterLink>
                    </ul>
                </div>
            </div>

        </div>
        <div class="mdl-layout__header-row mdl-color-text--white"
             style="padding: 5px 60px 0px 20px; margin-bottom: 0px;">
<!--            calculos-->
            <a class='mdl-layout__tab mdl-cell--hide-phone  mdl-cell--hide-tablet topo_opc1 mdl-color-text--grey-200 dropdown-toggle' href='#' data-bs-toggle='dropdown'
               aria-expanded='false'>Cálculos</a>
            <div class='dropdown-menu overflow-hidden py-0' style='padding-right: 50px !important;'>
                <div class='d-lg-flex'>
                    <div class='mega-dropdown-column pt-1 pt-lg-3 pb-lg-4' style='width: 300px;'>
                        <ul class='list-unstyled mb-0'>
                            <li>
                                <a class='dropdown-item'
                                   :href="urlApp+'/lista/atual'">Atualiza&ccedil;&atilde;o
                                    monet&aacute;ria</a>
                            </li>
                            <li>
                                <a class='dropdown-item'
                                   :href="urlApp+'/lista/trab'">C&aacute;lculos
                                    trabalhistas</a>
                            </li>
                            <li>
                                <a class='dropdown-item'
                                   :href="urlApp+'/lista/cponto'">Cart&atilde;o de
                                    ponto</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="urlApp+'/lista/dsr'">Descanso Semanal Remunerado</a>
                            </li>
                            <li>
                                <a class='dropdown-item'
                                   :href="urlApp+'/lista/finan'">Financiamento</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
<!--            tabelas-->
            <a class='mdl-layout__tab mdl-cell--hide-phone  mdl-cell--hide-tablet topo_opc1 mdl-color-text--grey-200 dropdown-toggle' href='#' data-bs-toggle='dropdown'
               aria-expanded='false'>Tabelas</a>
            <div class='dropdown-menu overflow-hidden py-0' style='padding-right: 50px important;'>
                <div class='d-lg-flex'>
                    <div class='mega-dropdown-column pt-1 pt-lg-3 pb-lg-4'>
                        <ul class='list-unstyled mb-0'>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/indicadores-economicos'">Indicadores econ&ocirc;micos</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/reajuste-aluguel'">Reajuste de aluguel</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/correcao-monetaria-trabalhista'">Tabelas trabalhistas</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/tabelas-irrf'">Hist&oacute;ricodo IRRF</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/tabelas-inss'">Hist&oacute;rico de Tabelas do INSS</a>
                            </li>
                        </ul>
                    </div>
                    <div class='mega-dropdown-column pb-2 pt-lg-3 pb-lg-4'>
                        <ul class='list-unstyled mb-0'>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/salario-familia'">Hist&oacute;rico do Sal&aacute;rio Fam&Iacute;lia</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/seguro-desemprego'">Hist&oacute;rico do Seguro Desemprego</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/juros-simples-e-compostos/1'">Juros simples e compostos</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/moedas'">Hist&oacute;rico de moedas brasileiras</a>
                            </li>
                            <li>
                                <a class='dropdown-item' :href="url+'/tabelas/cpmf'">Hist&oacute;rico do IPMF/CPMF</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <a :href="url+`/faq`"
               class="mdl-layout__tab mdl-cell--hide-phone  mdl-cell--hide-tablet topo_opc1 mdl-color-text--grey-200">Manual</a>

            <a :href="url+`/fale-conosco`" class="mdl-layout__tab mdl-cell--hide-phone  mdl-cell--hide-tablet topo_opc1 mdl-color-text--grey-200">Suporte</a>

            <a class="mdl-layout__tab mdl-cell--hide-phone  mdl-cell--hide-tablet topo_opc1 mdl-color-text--grey-200"  target='_blank' href='https://wa.me/message/GSVKJJLREHYDO1'>Atendimento</a>

        </div>

    </div>

</template>

<script setup>
import '@/assets/css/themeTopo.css'
import "@/assets/css/themeTopoAasp.css";
import { usePerfilStore } from "@/stores/PerfilStore";
import axios from "axios";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const url = import.meta.env.VITE_DEBIT_URL;
const urlApp = import.meta.env.VITE_APP_URL;
const perfilStore = usePerfilStore();
const router = useRouter();

const clientID = perfilStore.getIdDono;
const userName = perfilStore.getNomePerfil;
const ssoLogoutURL = "https://mnemosine.homolog.aasp.org.br/sso/sessao-encerrada";
const apiValidarSessao = `https://mnemosine.homolog.aasp.org.br/api/Usuario/ValidarSessaoAtiva?clientID=${clientID}&userName=${userName}`;

console.log("version: " + __VERSION__); // Mantém o log de versão

const verificarSessao = async () => {
    try {
        const response = await axios.get(apiValidarSessao, { headers: { Accept: "text/plain" } });

        if (response.data === false) {
            console.log("Sessão expirada, redirecionando para logout");
            logoutUsuario();
        }
    } catch (error) {
        console.error("Erro ao validar sessão:", error);
    }
};

const logoutUsuario = () => {
    console.log('logoutTopo');
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    router.push(ssoLogoutURL);
};

let sessionCheckInterval = null;

onMounted(() => {
    verificarSessao();

    sessionCheckInterval = setInterval(verificarSessao, 60000); // Verifica a sessão a cada 1min

    window.addEventListener("beforeunload", async () => {
        try {
            await fetch(
                "https://mnemosine.homolog.aasp.org.br/api/usuario/FecharSessoesPorId?codigoPessoa=15&clientId=certificadodigital",
                { method: "POST" }
            );
            //alternativa se nao funcionar:
            // const url = "https://mnemosine.homolog.aasp.org.br/api/usuario/FecharSessoesPorId?codigoPessoa=15&clientId=certificadodigital";
            // navigator.sendBeacon(url);
        } catch (error) {
            console.error("Erro ao encerrar sessão:", error);
        }
    });
});

onUnmounted(() => {
    clearInterval(sessionCheckInterval);
});
</script>


<!-- end olark code -->

<style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
</style>
