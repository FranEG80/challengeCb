const axios = require('axios')

const http = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/place/nearbysearch'
})

const request = (location, radius) => http.get('/json', {
  params: {
    language: "es",
    maxprice: 3,
    location: location,
    radius: radius,
    type: "restaurant",
    opennow: true, 
    key: process.env.GOOGLE_API_PLACE,
  }
})

module.exports = {
  request
}