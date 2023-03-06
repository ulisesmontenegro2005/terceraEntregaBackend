import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

const UserSchema = new Schema ({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true  
    },
    address: {
        type: String,
        required: true  
    },
    age: {
        type: Number,
        required: true  
    },
    tel: {
        type: Number,
        required: true  
    },
    avatar: {
        type: Object,
        required: true
    },
    cart: {
        type: Array,
        required: true
    }
})

UserSchema.pre('save', async function(next) {
    try {
        let hash;

        let salt = bcrypt.genSaltSync(10);

        hash = bcrypt.hashSync(this.password, salt);

        this.password = hash

        next()
    } catch (err) {
        return next(err);
    }
})

export const matchPassword = async (password, sessionPassword) => {
    try {
        return await bcrypt.compare(password, sessionPassword);

    } catch (err) {
        console.log(err);
    }
}

const UserModel = mongoose.model('user', UserSchema);

export default UserModel;