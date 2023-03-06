// EXPRESS -----------------

import express from 'express';

// SESSIONS -----------------

import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// HBS -----------------

import { engine as exphbs } from 'express-handlebars';

// DBS -----------------

import * as db from './src/db/mongodb/mongo.js';
import { matchPassword } from './src/db/mongodb/sessions.js';
import UserModel from './src/db/mongodb/sessions.js';

// PARSEARGS -----------------

import parseArgs from 'minimist';

const config = {
    alias: {
        p: "PORT",
        m: "MODE"
    }, 
    default: {
        PORT: 8080,
        MODE: 'FORK'
    }
}

let {MODE} = parseArgs(process.argv.slice(2), config)
MODE = MODE.toUpperCase()

// DIRNAME -----------------

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

// DOTENV -----------------

import * as dotenv from 'dotenv';
dotenv.config();
const dbClass = new db.Mongo;
db.connect();

// NODEMAILER -----------------

import { createTransport } from "nodemailer";
const EMAIL = process.env.EMAIL_ACCOUNT;
const PASS_EMAIL = process.env.EMAIL_PASSWORD;

const transporter = createTransport({
    service: 'gmail',
    port: 587,
    auth: {
        user: EMAIL,
        pass: PASS_EMAIL 
    }
});

// MULTER -----------------

import multer from 'multer';
const upload = multer({ dest: 'src/uploads' })

//----- SERVER -----//

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.static('public'));

    // ----- SESSION AND PASSPORT -----//

    app.use(session({
    cookie:{
        maxAge: 3600000
        },
    secret: 'secret',
    saveUninitialized: true,
    resave: false
    }));
    
    app.use(passport.initialize())
    app.use(passport.session())

    passport.use('register', new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
        const { name, address, age, tel } = req.body;
        const avatar = req.file;        
    
        const user = await UserModel.findOne({ "username": username });
    
        if (user) {
            return done(null, false, 'That user has already register')
        }

        const emailContent = {
            from: 'NodeJS app <noreply@example.com>',
            to: `BUlinton ${EMAIL}`,
            subject: 'New user advertisement',
            text: `New user email: ${username}`,
            html: `<html><p>New user email: ${username}</p></html>`,
        }

        try {
            const info = await transporter.sendMail(emailContent);
        } catch (error) {
            console.log(error);
        }
    
        const newUser = await UserModel.create({username,password,name,address,tel,age,avatar})
    
        done(null, newUser);
    }))
    
    passport.use('login', new LocalStrategy( async (username, password, done) => {
        let user = await UserModel.findOne({ "username": username })
    
        if (!user) {
            return done(null, false, 'This user not exist')
        }
    
        const isMatch = await matchPassword(password, user.password);
        if (!isMatch) return done(null, false, 'Incorrect password');
    
        done(null, user)
    }))
    
    passport.serializeUser((user, done) => {
        done(null, user.username)
    })
    
    passport.deserializeUser(async (username, done) => {
        const user = UserModel.findOne({ "username": username });
    
        done(null, user)
    })

    function requireAuthentication(req, res, next) {
        if (req.isAuthenticated()) {
            next()
        } else {
            res.redirect('/login')
        }
    }

    //----- HBS -----//

    app.engine('.hbs', exphbs({ extname: '.hbs', defaultLayout: 'main.hbs' }))
    app.set('views', path.join(__dirname, '/public/views'));
    app.set('view engine', '.hbs')

    //----- APP LOGIN && REGISTER -----//

    app.get('/', (req, res) => {
        res.redirect('/main')
    })

    app.get('/login', (req, res) => {
        if (req.user) {
            return res.redirect('/main')
        }
    
        res.sendFile(__dirname + '/public/login.html')
    })
    
    app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/main' }))
    
    app.get('/faillogin', (req, res) => {
        res.render('login-error')
    })

    app.get('/register', (req, res) => {
        if (req.user) {
            return res.redirect('/main')
        }

        res.sendFile(__dirname + '/public/register.html')
    })

    app.post('/register', upload.single('avatar'), passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/'}))

    app.get('/failregister', (req, res) => {
        res.render('register-error')
    })

    //------ LOGGED PAGES ------//

    app.get('/main', requireAuthentication, (req, res) => {
        res.sendFile(__dirname + '/public/main.html')
    })

    app.get('/cart', requireAuthentication, (req, res) => {
        res.sendFile(__dirname + '/public/cart.html')
    })

    app.get('/logout', (req, res) => {
        req.session.destroy()

        res.redirect('/')
    })

    //----- FETCHING DE DATOS -----//

    app.get('/get-user', async (req, res) => {
        if (!req.session.passport.user) {
            return res.redirect('/')
        }

        const user = await UserModel.findOne({'username': req.session.passport.user}, {__v: 0, _id: 0, password: 0});

        res.send(user)
    })

    app.get('/get-products', async (req, res) => {
        if (!req.session.passport.user) {
            return res.redirect('/')
        }

        let products = await dbClass.getProducts();

        res.send(products)
    })

    //----- CART POSTS -----//

    app.post('/cartAdd', requireAuthentication, async (req, res) => {
        let arr = []

        const prod = await dbClass.getProductsById(req.body.id);

        arr.push(prod)

        const user = await UserModel.findOne({'username': req.session.passport.user}, {__v: 0, _id: 0, password: 0});

        arr = arr.concat(user.cart)

        const userUpdate = await UserModel.updateOne({'username': req.session.passport.user}, { 'cart': arr });

        res.redirect('/')
    })

    app.post('/cartRemove', requireAuthentication, async (req, res) => {
        let arr = []

        const user = await UserModel.findOne({'username': req.session.passport.user}, {__v: 0, _id: 0, password: 0});

        arr = arr.concat(user.cart)

        arr = arr.filter(el => el._id !== req.body.id);

        const userUpdate = await UserModel.updateOne({'username': req.session.passport.user}, { 'cart': arr });

        res.redirect('/cart')
    })

    app.post('/buy', requireAuthentication, async (req, res) => {
        const user = await UserModel.findOne({'username': req.session.passport.user}, {__v: 0, _id: 0, password: 0});

        let prods = [];
        let price = 0;

        user.cart.forEach((prod) => {
            prods.push(prod.name);
            price += prod.price
        })

        const emailContent = {
            from: 'NodeJS app <noreply@example.com>',
            to: `Ulises ${EMAIL}`,
            subject: 'New order advertisement',
            text: `New user order: ${user.username}, order: ${prods.join(', ')}, total: ${price}`,
            html: `<html><p>New user order: ${user.username}, order: ${prods.join(', ')}, total: ${price}$</p></html>`,
        }

        try {
            const info = await transporter.sendMail(emailContent);
        } catch (error) {
            console.log(error);
        }

        const userUpdate = await UserModel.updateOne({'username': req.session.passport.user}, { 'cart': [] });

        res.redirect('/')
    })

    //----- LISTENING -----//
    
    const PORT =  process.env.PORT || 8080;

    app.listen(PORT, () => {
        console.log(MODE);
        console.log(`Listening in port ${PORT}`);
    })
// }































