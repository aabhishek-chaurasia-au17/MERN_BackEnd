require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const hbs = require('hbs');
const bcrypt = require('bcryptjs')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')


require('./db/conn')
const Register = require('./models/ragister')

const port = process.env.PORT || 5000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");


app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))

app.use(express.static(static_path));
app.set('view engine', 'hbs');
app.set('views', template_path)
hbs.registerPartials(partials_path)


app.get("/", (req, res) => {
    res.render('ragister')
})

app.get("/secret", auth, (req, res) => {
    console.log(`this is the cookies ${req.cookies.jwt}`);
    res.render('secret')
})

app.get("/logout", auth, async (req, res) => {
    try {
        console.log(req.user);
        
        // log out all devices
        req.user.tokens = [];


        res.clearCookie("jwt");
        console.log("logout successfully");
        await req.user.save();
        res.render('login');
    } catch (error) {
        res.status(500).send(error)
    }
})

app.get("/ragister", (req, res) => {
    res.render('ragister')
})

app.get("/login", (req, res) => {
    res.render('login')
})

// create a new user in our database
app.post("/ragister", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;

        
        if(password === cpassword) {

            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age:req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            })

            console.log("the success part" + registerEmployee);

            const token = await registerEmployee.generateAuthToken()
            console.log("the part" + token);

            res.cookie("jwt", token, {
                expires:new Date(Date.now() + 30000),
                httpOnly:true
            });
            console.log(cookie);

            const registered = await registerEmployee.save()
            console.log("the page part" + registered);
            res.status(201).render("index")

        }else{
            res.send("password are not matching")
        }

    } catch (error) {
        res.status(400).send(error)
        console.log("the error part page");
    }
})


// login check 
app.post('/login', async (req, res) => {
    try {
        const email = req.body.email
        const password = req.body.password

    const useremail = await Register.findOne({email:email});

    const isMatch = await bcrypt.compare(password,useremail.password)
    
    const token = await useremail.generateAuthToken()
    console.log("the part" + token);
    
    res.cookie("jwt", token, {
            expires:new Date(Date.now() + 600000),
            httpOnly:true,
            // secure:true
    });
    

    if(isMatch) {
        res.status(201).render("index")
    }else{
        res.send("invalid login Details")
    }

    } catch (error) {
        res.status(400).send(error)
    }
})


app.listen(port, (req, res) =>{
    console.log(`server is running at port no ${port}`);
})