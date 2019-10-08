const axios = require('axios')

const http = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/place/nearbysearch'
})

const request = () => http.get('/json', {
  params: {
    language: "es",
    maxprice: 3,
    location: "40.448952, -3.670866",
    radius: "500",
    type: "restaurant",
    key: process.env.GOOGLE_API_PLACE,
  }
})

module.exports = {
  request
}