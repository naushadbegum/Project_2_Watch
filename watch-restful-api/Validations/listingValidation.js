const {object, string, array, number} = require('yup');


const listingSchema = object({
    // brand: string().required(),
    // model: string().required(),
    // price: string().required(),
    // datetime: string().required(),
    // year_made: number().required(),
    // water_resistance: number().required(),
    // glass_material: string().required(),
    // movements: string().required(),
    // watch_calender: string().required(),
    // image: string().required(),
    // gender: string().required(),
    // watch_case: string().required(),
    // strap: string().required(),
    // user: string().required(),
    // review: array().required()
    
})

module.exports = {
    listingSchema
}