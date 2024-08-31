const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
require('./config/mysqlConfig')
const errorHandler = require('./middleware/errorhandler');
const userRouter = require('./router/userRouter')
const accountRouter = require('./router/accountRouter');
const passport = require('./config/passportConfig');
const sessionConfig = require('./config/sessionConfig');
const session = require('express-session');

app.use(cors());
app.use(express.json());

// Middleware
app.use(session(sessionConfig));
passport(app);

app.get("/",(req,res)=>{
    res.send({message:"Set up"})
})

// userRouter
app.use('/user',userRouter);

// accountRouter
app.use('/act',accountRouter);

// errorhandler middleware
app.use(errorHandler);

app.listen(process.env.SERVER_PORT_NUMBER,()=>{
    console.log("Server is running!");
})