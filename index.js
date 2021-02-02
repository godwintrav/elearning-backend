const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoute');
const adminRoutes = require('./routes/adminRoute');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');
const instructorRoute = require('./routes/instructorRoute');
const studentRoute = require('./routes/studentRoute');



//middlewares
app.use(express.json());
app.use(cookieParser());


//routes
app.use("/api/auth",authRoutes);
app.use("/api/admin" , authMiddleware.authorize("admin"),adminRoutes);
app.use("/api/instructor", instructorRoute);
app.use("/api/student", studentRoute);


//database connection
mongoose.connect(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
    .then((result) => {
        var PORT = process.env.PORT || 3000;
        var server = app.listen(PORT);
        // server.timeout = 1800000; 
        console.log("DB Connected");
    })
    .catch(err => console.log(err));
    



//404 not found
app.use((req, res) => {
    return res.status(404).json({error: "URL not found"});
})