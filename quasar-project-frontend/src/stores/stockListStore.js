import { defineStore } from 'pinia';
import axios from 'axios'

export const useStockListStore = defineStore('stockList', {
  state: () => ({
    list: []
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    pushStock(stockId) {
      this.list.push(stockId)
    },
    setList( list ) {
        console.log(list)
        this.list = list.sort((a, b) => Number(a.stock_id) - Number(b.stock_id))
    },
    getList() {
        return this.list
    },
    getStockPrice() {
        console.log('getStockPrice')
        const path = 'http://localhost:8800/realPrice';
        return axios.get(path)
        .then(({ data: data }) => {
            console.log("getStockPrice",data)
            this.setList(data)
        })
    },
    addStock(stockId) {
        const path = 'http://localhost:8800/addPrice';
        this.pushStock(stockId)
        return axios.post(path, { 
            id: parseInt(stockId)
        })
            .then(({ data: data }) => {
                console.log(data)
                this.setList(data)
            })  
    },
    removeStock(stockId) {
        const path = 'http://localhost:8800/removePrice';
        return axios.post(path, { id: stockId } )
        .then(({ data: data }) => {
            console.log(data);
            this.setList(data)
        })
    }
  },
});
