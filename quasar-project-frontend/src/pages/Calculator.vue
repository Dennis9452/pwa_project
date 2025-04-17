<template>
    <div class="calculate w-full q-pa-xl">
        <div class="row flex justify-center items-center">
            <span class="bg-white q-mr-sm">底</span>
            <ItemInput 
                v-model:value="base"
                :disable="isLock"
                class="bg-white q-mr-sm col-2"
                name="底"
                label="底"
                :clearable="false"
                :showSearch="false"
            /> 
            <span class="bg-white q-mr-sm">/ 台錢</span>
            <ItemInput 
                v-model:value="bonus"
                :disable="isLock"
                class="bg-white q-mr-sm col-2"
                name="台錢"
                label="台錢"
                :clearable="false"
                :showSearch="false"
            />
            <q-btn 
                class="py-5"
                :color="isLock ? 'warning' : 'primary'" 
                :label="isLock ? '編輯' : '鎖定'" 
                @click="isLock = !isLock" 
            />
        </div>
        
        <div class="q-my-md">
            <q-btn :disable="isLock" color="primary" label="編輯用戶名稱" @click="openEditDialog" />
            <q-btn color="warning" label="恢復上次狀態"  class='q-ml-md' @click="getPreviousState" />
        </div>

        <div class="w-full">
            <q-table
                :rows="transactions"
                :columns="columns"
                row-key="id"
                flat
                bordered
                hide-bottom
                class="sticky-column-table q-mb-md"
            >
                <template v-slot:body-cell="props">
                    <q-td :props="props">
                        <template v-if="props.col.id === 0">
                            {{ props.row.id }}
                        </template>
                        <template v-else-if="props.col.id !== props.rowIndex + 1">
                            <div class="flex justify-center items-center">
                                <span class="q-mr-sm">{{ props.rowIndex < props.col.id ? '贏' : '贏' }}</span>
                                <q-select
                                v-model="transactions[props.rowIndex][props.col.field]" 
                                :options="options"
                                :name="props.col.field"
                                bg-color="#31CCEC" 
                                type="number"
                                @update:model-value="updateValue(props.rowIndex,  props.col.id, props.row.id, props.col.field)"
                                />
                                <span class="q-ml-sm">台</span>
                            </div>
                        </template>
                        <span v-else>--</span>
                    </q-td>
                </template>
            </q-table>
        
            <div class="q-mt-md flex justify-between items-center">
                <q-btn 
                :disable="!isLock"
                @click="reset"
                class="q-mx-md col-6 col-xs-2"
                type="submit"
                :color="!isLock ? 'grey-4' : 'primary'"
                :class="{
                    'cursor-not-allowed opacity-50': !isLock,
                    'q-px-xl q-py-sm': true
                }"
                >
                    <span :class="{ 'text-grey-6': !isLock }">清除</span>
                </q-btn>
                <q-btn 
                :disable="!isLock"
                @click="calculateBalances"
                class="q-mx-md"
                type="submit"
                :color="!isLock ? 'grey-4' : 'primary'"
                :class="{
                    'cursor-not-allowed opacity-50': !isLock,
                    'q-px-xl q-py-sm': true
                }"
                >
                    <span :class="{ 'text-grey-6': !isLock }">計算</span>
                </q-btn>
            </div>
            <!-- <table v-if="isLock" border="1">
                <thead>
                    <tr>
                        <th>User</th>
                        <th v-for="user in users" :key="user">{{ user }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, rowIndex) in users" :key="rowIndex">
                        <td>{{ user }}</td>
                        <td
                            v-for="(otherUser, colIndex) in users"
                            :key="colIndex"
                        >
                            <template v-if="rowIndex !== colIndex">
                                {{ rowIndex < colIndex ? '輸' : '贏' }}
                                <input
                                    type="number"
                                    v-model.number="transactions[rowIndex][colIndex]"
                                    placeholder="0"
                                    @input="updateBonus(rowIndex, colIndex)"
                                />
                                台
                            </template>
                            <span v-else>--</span>
                        </td>
                    </tr>
                </tbody>
            </table> -->
        </div>
        <h4>餘額</h4>
        <div class="row q-col-gutter-md">
            <div 
            class="col-lg-3 col-xs-6"  
            v-for="(balance, index) in balances" :key="index">
                <q-card class="text-center" :style="{ 'background-color': balance > 1000 ? '#e06c75' : balance === 1000 ? '#f1ece1' : '#98c379' }">
                    <q-card-section>
                        <div class="text-h6">{{ users[index] }}</div>
                        <div class="text-h8">{{ balance }}</div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </div>
    <!-- 編輯用戶名稱的對話框 -->
    <q-dialog v-model="editDialog">
        <q-card standout style="min-width: 350px">
            <q-card-section>
                <div class="text-h6">編輯用戶名稱</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
                <div v-for="(user, index) in users" :key="index" class="q-mb-sm">
                    <q-input
                        v-model="tempUsers[index]"
                        :label="`用戶 ${index + 1}`"
                        dense
                        outlined
                        standout
                    />
                </div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="取消" color="primary" v-close-popup />
                <q-btn flat label="確認" color="primary" @click="saveUserNames" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
<script>
export default {
    name: "GainLossCalculator"
}
</script>
<script setup>
    import { ref, computed } from 'vue'
    import ItemInput from '../components/ItemInput.vue'
    import { watch } from 'vue';

    const users = ref(["User 1", "User 2", "User 3", "User 4"])
    const isLock = ref(false)
    const isInit = ref(true)
    const tempUsers = ref([])
    const editDialog = ref(false)
    const options = ref(['屁胡', ...Array.from({ length: 10 }, (_, i) => i + 1)])
    const columns = computed(() => {
        const col = [{
                id: 0,
                align: 'left',
                name: 'id',
                label: '玩家', 
                field: 'id'
            }]
        users.value.map((user, index) => {
            col.push({
                id: index + 1,
                name: user,
                align: 'center', 
                label: user, 
                field: user
            })
        })
        return col
    })
    const transactions = ref([])
    const base = ref('')
    const bonus = ref('')
    const balances = ref([1000, 1000, 1000, 1000])

    const saveUserNames = () => {
        users.value = tempUsers.value
    }

    const openEditDialog = () => {
        tempUsers.value = [...users.value]
        editDialog.value = true
    }

    const calculateBalances = () => {
        isInit.value = false
        localStorage.setItem('previousTransactions', JSON.stringify(transactions.value))
        localStorage.setItem('previousBalances', JSON.stringify(balances.value))
        // 只遍历上半部分的交易记录，避免重复计算
        for(let i = 0; i < users.value.length; i++) {
            for(let j = 0; j < users.value.length; j++) {
                // 获取两个方向的交易值
                if(transactions.value[i][users.value[j]] === 0) continue
                    if(transactions.value[i][users.value[j]] === '屁胡') {
                        balances.value[i] += Number(base.value)
                        balances.value[j] -= Number(base.value)
                    } else{
                        // i 输给 j
                        balances.value[i] += transactions.value[i][users.value[j]] * Number(bonus.value) + Number(base.value)
                        balances.value[j] -= transactions.value[i][users.value[j]] * Number(bonus.value) + Number(base.value)
                    }
            }
        }
        
        // 重置交易记录
        transactions.value = resetTransactions()
    }
    const resetTransactions = () => {
        const row = []
        for(let i = 0; i < users.value.length; i++) {
            const obj = { id : users.value[i] }
            obj.colIndex = i
            for(let j = 0; j < users.value.length; j++) {
                obj[users.value[j]] = 0 
            }
            row.push(obj)
        }
        return row
    }
    const reset = () => {
        isInit.value = true
        transactions.value = resetTransactions()
        balances.value = [1000, 1000, 1000, 1000]
    }
    const updateValue = (rowIndex, colIndex, rowid, colid) => {
        if(transactions.value[rowIndex][colid] < 0) {
            transactions.value[rowIndex][colid] = 0
            return
        }
    }
    const getPreviousState = () => {
        console.log('getPreviousState', localStorage)
        const previousTransactions = localStorage.getItem('previousTransactions')
        const previousBalances = localStorage.getItem('previousBalances')
        transactions.value = JSON.parse(previousTransactions)
        balances.value = JSON.parse(previousBalances)
    }

    const init = () => {
        reset()
        localStorage.setItem('previousTransactions', JSON.stringify(transactions.value))
        localStorage.setItem('previousBalances', JSON.stringify(balances.value))
    }
    
    init()
    watch(users, () => {
        const row = []
        for(let i = 0; i < users.value.length; i++) {
            const obj = { id : users.value[i] }
            for(let j = 0; j < users.value.length; j++) {
                obj[users.value[j]] = 0 
            }
            row.push(obj)
        }
        transactions.value = row
    },{
        deep: true,
        immediate: true
    })

</script>

<style lang="scss">
.sticky-column-table {
  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  thead tr {
    background-color: #8eaca7c9;
  }

  thead tr:first-child th:first-child {
    /* bg color is important for th; just specify one */
    background-color: #71807d;
  }

  td:first-child {
    background-color: #b9b9b9;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    z-index: 1;
  }
}
</style>