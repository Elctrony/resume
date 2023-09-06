const mongoose =require('mongoose')
const express  = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('./user');
const app = express();


app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true }));


app.post('/signup',async(req,res,next)=>{
    const requestBody = req.body;
    console.log("SIGN UP request");
    const email = requestBody['email'];
    const name = requestBody['name'];
    const password = requestBody['password'];
    console.log({email:email,name:name,password:password});
    try {
        const hashedPw = await bcrypt.hash(password,10);

        const user = new User({
            email: email,
            password: hashedPw,
            name: name
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created!', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
})

app.post('/login', async (req, res, next) => {
    console.log("Login request");
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'tryhardtounderstand',
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
app.use((req,res,next)=>{
    res.send("Hi");
    console.log('Hi');
})

app.listen(8080,()=>{
    console.log("Server is running on port 8080");
});
mongoose
    .connect('mongodb+srv://Electrony:monaga2003@cluster0.pcqfa.mongodb.net/resume?retryWrites=true&w=majority')
    .then(result => {
        console.log("DATABASE connected");
    })
    .catch(err => console.log(err));
