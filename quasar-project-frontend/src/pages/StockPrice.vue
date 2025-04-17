<template>
    <div>
        <div class="container bg-grey-9">
            <q-card 
            class="my-card" 
            bordered
            >
                <q-table
                class="my-sticky-header-table bg-grey-9 text-white b"
                flat bordered 
                title="Treats"
                :rows="response"
                :columns="columns"
                row-key="name"
                :loading="isLoading"
                :pagination="pagination"
                :visibleColumns="visibleColumns"
                virtual-scroll
                >
                    <template v-slot:top>
                        <div class="row inline col-12  justify-between">
                            <div class="row col-6 justify-start">
                                <ItemInput 
                                    v-model:value="stockId"
                                    class="bg-white q-mr-sm col-auto"
                                    name="stockId"
                                    label="stockId"
                                />
                                <q-btn class="col-auto" color="primary q-mr-sm w-4" label="送出" name="送出" value="送出"  @click="api.addStock(stockId)" />
                                <q-btn class="col-auto" color="secondary q-mr-sm w-4" label="刷新" name="刷新" value="刷新"  @click="api.refreshList()"/>
                            </div>
                            <div class="row col-6 no-wrap">
                                <template v-for="column in columns" :key="column.name">
                                    <q-toggle v-model="visibleColumns"  :val="column.name" :label="column.label" class="col-auto" />
                                </template>
                            </div>
                        </div>
                        
                    </template>
                    <q-td :props="props" />
                    <template #body-cell-price="props">
                        <q-td :props="props">
                            <transition
                            appear
                            enter-active-class="animated fadeIn slower"
                            leave-active-class="animated fadeOut"
                            >
                                <q-badge class="shadow-10" text-color="white" :label="props.value" :color="textColor('base', props.value, props.row.referencePrice)" />
                            </transition>
                        </q-td>
                    </template>
                    <template #body-cell-change="props">
                        <q-td :props="props">
                            <q-badge class="shadow-10" text-color="white" :label="props.value" :color="textColor('rate', props.value)"/>
                        </q-td>
                    </template>
                    <template #body-cell-changePercent="props">
                        <q-td :props="props">
                            <q-badge class="shadow-10" text-color="white" :label="props.value" :color="textColor('rate', props.value)"/>
                        </q-td>
                    </template>
                    <template v-slot:body-cell-actions="props">
                        <q-td :props="props">
                            <q-btn color="red" icon="delete" @click="api.removeStock(props.row.stock_id)"></q-btn>    
                        </q-td>
                    </template>  
                    <template v-slot:loading>
                        <q-inner-loading 
                        :showing="isLoading" 
                        color="white"
                        label="Please wait..."
                        label-class="text-teal"
                        label-style="font-size: 1.1em" 
                        />
                    </template> 
                </q-table>
            </q-card>
        </div>
    </div>
    <q-dialog v-model="alert" :backdrop-filter="'grayscale(100%)'">
      <q-card>
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
            伺服器異常請稍後再試
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
</template> 
  <script setup>
    import ItemInput from 'components/ItemInput.vue'
    import { ref, watch } from "vue"
    import { useStockListStore } from 'stores/stockListStore.js'
  
    const refresh = ref(false)
    const alert = ref(false)
    const isLoading = ref(false)
    const response = ref([])
    const stockId = ref(null)
    const pagination = ref({
        rowsPerPage: 10
      })
    const columns = ref([
        {
            name: 'id',
            // required: true,
            label: '股票代號',
            align: 'left',
            field: row => row.stock_id,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'stock_name',
            // required: true,
            label: '股票名稱',
            align: 'left',
            field: row => row.stock_name,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'referencePrice',
            // required: true,
            label: '開盤價',
            field: row => row.referencePrice,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'price',
            // required: true,
            label: '股價',
            field: row => row.deal[0]?.price,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'volume',
            // required: true,
            label: '總量',
            field: row => row?.tradeVolume || '無資料',
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'change',
            // required: true,
            label: '漲跌幅',
            field: row => row.change,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'changePercent',
            // required: true,
            label: '漲跌幅比',
            field: row => row.changePercent,
            format: val => `${val}`,
            sortable: true
        },
        {
            name: 'update_time',
            // required: true,
            label: '更新時間',
            field: row => row.update_time,
            format: val => `${new Date(val)}`,
            sortable: true
        },
        {
            name: 'actions', 
            label: '操作'
        },
    ])
    const visibleColumns = ref(['id', 'stock_name', 'referencePrice', 'price', 'volume', 'change', 'changePercent', 'update_time', 'actions'])
    const stockStore = useStockListStore()

    
    const api = {
        getStockPrice: () => {
            isLoading.value = true
            refresh.value = false
            stockStore.getStockPrice()
            .then(() => {
                response.value = stockStore.getList()
                isLoading.value = false
                timer()
            }).catch((error) => {
                console.log(error)
                alert.value = true
                isLoading.value = false
                response.value = stockStore.getList()
                setTimeout(() => timer(), 5000) 
            })
        },
        addStock: (stockId) => {
            stockStore.addStock(stockId)
            api.getStockPrice()
        },
        removeStock: (stockId) => {
            stockStore.removeStock(stockId)
            api.getStockPrice()
        },
        refreshList: () => api.getStockPrice()
    }

    function textColor(type, value, base){
        return  type === 'rate' ? Number(value) > 0 ? 'red' : Number(value) === 0 ? 'transparent' : 'green' 
        :  Number(value) > Number(base) ? 'red' : Number(value) === Number(base) ? 'transparent' : 'green'
    }


    api.getStockPrice()


    watch(refresh, (val, oldVa) => {
        console.log("val,oldVa", val,oldVa)
        if(val) api.getStockPrice()
    }, {
        immediate: true
    })
        
    const timer = function() {
        setTimeout(() => {
            refresh.value = true
        }, 5000)
    }
    defineOptions({
        name: 'StockPrice'
    })
    
  </script>
  
  <style>
  table tr {
      margin: 15px;
  }
  </style>