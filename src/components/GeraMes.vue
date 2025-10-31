<template>
    <div>
        <table class="cal_mes">
            <thead>
                <tr>
                    <td colspan="7">{{ nomeMes.name }}</td>
                </tr>
                <tr>
                    <td>D</td>
                    <td>S</td>
                    <td>T</td>
                    <td>Q</td>
                    <td>Q</td>
                    <td>S</td>
                    <td>S</td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(week, index) in weeks" :key="index">
                    <td
                        v-for="(day, dayIndex) in week"
                        :key="dayIndex"
                        :id="formattedDate(day, mes)"
                        :style="{
                            backgroundColor: getBackgroundColor(
                                formattedDate(day, mes)
                            ),
                        }"
                        @click="toggleSelection(day, mes)"
                    >
                        {{ day !== undefined ? day : '' }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
  
  <script>
import { ref, watchEffect, onMounted } from 'vue'

export default {
    name: 'Filho',
    props: {
        mes: Number,
        ano: Number,
        preSelectedDays: {
            type: Array,
            default: () => [],
        },
    },
    emits: ['update:checkedValues'],
    setup(props, { emit }) {
        const weeks = ref([])
        const selectedDays = ref([])
        const backgroundColors = ref({})
        const nomeMes = ref('')

        const initializeCalendar = () => {
            const startOfMonth = new Date(props.ano, props.mes - 1, 1)
            const endOfMonth = new Date(props.ano, props.mes, 0)
            const daysInMonth = endOfMonth.getDate()
            const startDayOfWeek = startOfMonth.getDay()

            let currentDay = 1
            let currentWeek = 0

            while (currentDay <= daysInMonth) {
                if (currentWeek >= weeks.value.length) {
                    weeks.value.push(new Array(7))
                }

                for (let i = 0; i < 7; i++) {
                    if (currentWeek === 0 && i < startDayOfWeek) {
                        weeks.value[currentWeek][i] = undefined
                    } else if (currentDay > daysInMonth) {
                        weeks.value[currentWeek][i] = undefined
                    } else {
                        weeks.value[currentWeek][i] = currentDay++
                    }
                }

                currentWeek++
            }
        }

        const updateBackgroundColors = () => {
            backgroundColors.value = {}
            
            if(props.preSelectedDays){
                // console.log(props.mes)
                const formattedMonth = props.mes < 10 ? `0${props.mes}` : `${props.mes}`
                selectedDays.value = Object.values(props.preSelectedDays).filter(item => item.endsWith(formattedMonth));
                // emit('update:checkedValues', selectedDays.value)
                
                // console.log(props.preSelectedDays)
                
                props.preSelectedDays.forEach((id) => {
                    backgroundColors.value[id] = 'yellow'
                })
            }
        }

        initializeCalendar()
        // updateBackgroundColors()

        watchEffect(() => {
            updateBackgroundColors()
        })

        const toggleSelection = (day, month) => {
            if(day!==undefined){
                const formattedDateStr = formattedDate(day, month)

                if (backgroundColors.value[formattedDateStr] === 'yellow') {
                    backgroundColors.value[formattedDateStr] = 'white'
                } else {
                    backgroundColors.value[formattedDateStr] = 'yellow'
                }

                const index = selectedDays.value.indexOf(formattedDateStr)
                if (index === -1) {
                    selectedDays.value.push(formattedDateStr)
                } else {
                    selectedDays.value.splice(index, 1)
                }

                emit('update:checkedValues', {mes:month, arr_dias:selectedDays.value})
            }
        }

        const formattedDate = (day, month) => {
            const formattedMonth = month < 10 ? `0${month}` : `${month}`
            const formattedDay = day < 10 ? `0${day}` : `${day}`
            return `${formattedDay}${formattedMonth}`
        }

        const getBackgroundColor = (id) => {
            return backgroundColors.value[id] || 'white'
        }

        const months = [
            { key: 1, name: 'JANEIRO' },
            { key: 2, name: 'FEVEREIRO' },
            { key: 3, name: 'MARÇO' },
            { key: 4, name: 'ABRIL' },
            { key: 5, name: 'MAIO' },
            { key: 6, name: 'JUNHO' },
            { key: 7, name: 'JULHO' },
            { key: 8, name: 'AGOSTO' },
            { key: 9, name: 'SETEMBRO' },
            { key: 10, name: 'OUTUBRO' },
            { key: 11, name: 'NOVEMBRO' },
            { key: 12, name: 'DEZEMBRO' },
        ]

        nomeMes.value = months.find((month) => month.key === props.mes)

        // const updateSelectedDays = () => {
        //     selectedDays.value = props.preSelectedDays.filter((day) => {
        //         const dayMonth = day.slice(0, 2)
        //         return parseInt(dayMonth, 10) === props.mes
        //     })
        // }

        
        // onMounted(() => {
            // emit('update:checkedValues', selectedDays.value)
        // })

        return {
            weeks,
            toggleSelection,
            formattedDate,
            nomeMes,
            getBackgroundColor,
        }
    },
}
</script>

<style>
.tabela_geral td {
    vertical-align: top;
    padding: 5px;
}
.cal_mes td {
    border: 1px #d3d3d3 solid;
    width: 28px;
    height: 28px;
    text-align: center;
    padding: 4px;
    cursor: pointer;
    vertical-align: middle !important;
    font-size: 12px;
    color: #333;
}
</style>
  