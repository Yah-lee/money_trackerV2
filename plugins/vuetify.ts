import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          colors: {
            primary: '#1867C0',
            secondary: '#5CBBF6',
            success: '#4CAF50',
            error: '#FF5252',
            info: '#2196F3',
            warning: '#FFC107',
            income: '#4CAF50',
            expense: '#FF5252',
          },
        },
      },
    },
  })

  app.vueApp.use(vuetify)
}) 