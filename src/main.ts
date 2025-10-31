import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { VueReCaptcha } from 'vue-recaptcha-v3'

import 'bootstrap/dist/js/bootstrap.bundle.js'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPix } from '@fortawesome/free-brands-svg-icons'
import { faStar as farStar } from "@fortawesome/free-regular-svg-icons";
import { faGear, faCirclePlus, faCircleMinus, faCircleXmark, faXmark, faCheck, faUndo, faArchive, faTrash,
    faSearch, faFileText, faCopy, faPencil, faUserFriends, faQuestionCircle, faStar as fasStar } from '@fortawesome/free-solid-svg-icons'

library.add(faGear, faCirclePlus, faCircleMinus, faCircleXmark, faPencil,
    faCheck, faUndo,faArchive, faXmark, faTrash, faSearch, faFileText, faCopy,
    faUserFriends, faPix, faQuestionCircle, fasStar, farStar)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(VueReCaptcha, {
    siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
    loaderOptions: {
        autoHideBadge: true,
        explicitRenderParameters: {
            badge: 'bottomright',
        },
    }
})
app.use(createPinia())
app.use(router)

app.mount('#app')
