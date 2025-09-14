import axios from 'axios'

const jsonServerApi = axios.create({
    baseURL: 'http://localhost:4000',
    withCredentials: true,
})

const nextApi = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
})

jsonServerApi.interceptors.request.use(
    config => {
        console.log('JSON Server Request:', config.url)
        return config
    },
    (error) => Promise.reject(error)
)

jsonServerApi.interceptors.response.use(
    (response) => response, 
    (error) => {
      if (error.response) {
        console.log(
          `JSON Server API Error ${error.response.status}:`,
          error.response.data
        )
      } else {
        console.log('JSON Server Network Error:', error.message)
      }
      return Promise.reject(error)
    }
)

nextApi.interceptors.request.use(
    config => {
        console.log('Next.js API Request:', config.url)
        return config
    },
    (error) => Promise.reject(error)
)

nextApi.interceptors.response.use(
    (response) => response, 
    (error) => {
      if (error.response) {
          
      } else {
        console.log('Next.js API Network Error:', error.message)
      }
      return Promise.reject(error)
    }
)

export default jsonServerApi;
export { nextApi };
