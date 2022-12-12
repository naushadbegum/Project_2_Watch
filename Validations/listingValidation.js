const {object, string, number} = require('yup');


const listingSchema = object({
    brand: string().required(),
    model: string().required(),
    price: number().required(),
    year_made: number().required(),
    water_resistance: string().required(),
    glass_material: string().required(),
    movements: string().required(),
    image: string().required(),
    gender: string().required(),
})

module.exports = {
    listingSchema
}