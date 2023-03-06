import mongoose from 'mongoose';

const messagesCollection = 'messages';

const productsCollection = 'products';

const messagesSchema = new mongoose.Schema({
    author: {
        id: String,
        nombre: String,
        apellido: String,
        edad: Number,
        alias: String,
        icon: String
    },
    text: String,
    hora: String
})

const productsSchema = new mongoose.Schema({
    name: String,
    price: Number,
    img: String
})

export const messages = mongoose.model(messagesCollection, messagesSchema);

export const products = mongoose.model(productsCollection, productsSchema);
