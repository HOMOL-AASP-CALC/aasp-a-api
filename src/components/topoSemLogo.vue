<script setup lang='ts'>
console.log('TopoSemLogo')

const runtimeConfig = {
    public: {
        servidorWWW: import.meta.env.VITE_DEBIT_URL
    }
}

const urlDebit = import.meta.env.VITE_APP_URL
</script>

<template>
    <main class="page-wrapper">
        <header class="navbar navbar-expand-lg fixed-top bg-light fixed-marcelo">
            <div class="container">
                <a class="navbar-brand pe-sm-3" :href="runtimeConfig.public.servidorWWW">
                    <span class="text-primary flex-shrink-0 me-2" style="width: 120px">

                    </span>
                </a>

                <a class='navbar-brand pe-sm-3' :href="urlDebit">
                    <span class='text-primary flex-shrink-0 me-2'>
                        <img src='../assets/img/logo-aasp.png' width='120' height='30' alt='logotipo-debit'>
                    </span>
                </a>


                <button class='navbar-toggler ms-3' type='button' data-bs-toggle='collapse'
                        data-bs-target='#navbarCollapse5'>
                    <span class='navbar-toggler-icon'></span></button>




                <nav class="collapse navbar-collapse" id="navbarNav">

                    <ul class="navbar-nav navbar-nav-scroll me-auto" style="--ar-scroll-height: 520px;">
                        <li class="nav-item ">
                            <RouterLink to="/lista/atual" class="nav-link  m_menu">
                                Meus Cálculos
                            </RouterLink>
                        </li>

                        <li class="nav-item dropdown">
                            <a class="nav-link" href="https://www.aasp.org.br/associe-se/" style="color: red;"
                                aria-expanded="false"><span class="text-danger m_menu">Assine J&aacute;</span></a>
                        </li>
                    </ul>
                </nav>
            </div>

        </header>

    </main>

</template>

<style>
    .m_menu {
        font-size: 17px !important;
        font-weight: 500 !important;
        font-family: 'Inter', sans-serif !important;
    }

    .fixed-marcelo {
        position: fixed;
        top: 0;
        right: 0;
        left: 0;
        z-index: 2;
        border-bottom: 1px solid #ddd;
        /* box-shadow: 0px 3px 3px #eee; */
    }
</style>
