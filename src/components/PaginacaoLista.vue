<template>
    <nav>
        <ul class="pagination">
            <li class="page-item d-none d-sm-block"
                v-for="(page, index) in pages"
                :key="index"
                :class="{ current: page === current }"
            >
                <button v-if="current !== page" class="page-link" @click="trocarPagina(page)">
                    {{ page }}
                </button>
                <span v-else class="page-link active">
                    <b >{{ page }}</b>
                </span>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'PaginacaoLista',
    props: {
        offset: {
            type: [String, Number],
            default: 1
        },
        limit: {
            type: [String, Number],
            default: 7
        },
        total: {
            type: [String, Number],
            default: 1
        },
    },
    computed: {
        current() {
            return this.offset ? this.offset : 1;
        },
        pages() {
            const qty = Math.ceil(this.total / this.limit);
            //paginacao com 7 paginas por vez, anterior e proximo
            let pages = [];
            let current = this.current;
            let last = qty;
            let limit = this.limit;
            let delta = 2;
            let left = current - delta;
            let right = current + delta + 1;
            let range = [];
            let rangeWithDots = [];
            let l;

            for (let i = 1; i <= last; i++) {
                if (i == 1 || i == last || i >= left && i < right) {
                    range.push(i);
                }
            }

            for (let i of range) {
                if (l) {
                    if (i - l === 2) {
                        rangeWithDots.push(l + 1);
                    } else if (i - l !== 1) {
                        //if last
                        if (i == last) {
                            rangeWithDots.push('>>>');
                        }else {
                            rangeWithDots.push('<<<');
                        }
                    }
                }
                rangeWithDots.push(i);
                l = i;
            }

            //count '...' in rangeWithDots with filter
            let count = rangeWithDots.filter(function (item) {
                return item === '>>>';
            }).length;

            //se tiver mais de 1 '...' no array
            if (count > 1) {
                //find first and replace with '<<<'
                let index = rangeWithDots.indexOf('>>>');
                rangeWithDots[index] = '<<<';
            }

            return rangeWithDots;
        },
    },
    methods: {
        trocarPagina(offset) {
            console.log('trocando para pagina: '+offset);

            if(offset === '>>>'){
                offset = this.current + 5;
            }
            if (offset === '<<<') {
                offset = this.current - 5;
            }

            this.$emit('trocar-pagina', offset);
        },
    },
}
</script>
