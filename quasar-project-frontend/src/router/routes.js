const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'Calculator',
        name: 'Calculator',
        component: () => import('pages/Calculator.vue')
      },
      {
        path: 'StockPrice',
        name: 'StockPrice',
        component: () => import('pages/StockPrice.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
