const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require ('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const fileUpload = require("express-fileupload"); 
const shortid = require('shortid');
const multer = require('multer');
const path = require('path');
const File = require('./models/fileupload');
const ejs = require('ejs');


const app = express();

app.use(express.json());


mongoose.connect('mongodb://127.0.0.1:27017/mobiq')
.then(()=> console.log('Mongodb is connected'))
.catch((e)=> console.log(e))

// Passport Config
require('./config/passport')(passport);



//EJS 
app.use(expressLayouts);
app.set('view engine', 'ejs');


// Express body parser
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  // Passport middleware
app.use(passport.initialize());
app.use(passport.session());


  // Connect flash
app.use(flash());




// Global variables
app.use((req, res, next)  =>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//Routes 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));



 // Multer setup for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
      const uniqueCode = shortid.generate();
      cb(null, uniqueCode + path.extname(file.originalname));
    },
  });
  
  const upload = multer({ storage: storage });

  // Serve the HTML file
app.get('/partials/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.js'));
  });

  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      // Save file details to MongoDB
      
      const file = new File({
        filename: req.file.filename,
        originalname: req.file.originalname,
        uniqueCode: req.file.filename.split('.')[0],
      });
  
      await file.save();
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  

  app.get('/files', async (req, res) => {
    try {
  
      const files = await File.find({ user: user._id });
      res.json(files);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    
  });

app.post('/', (req,res)=>{
  res.render('dashboard');
});
app.post("/download-code", async(req,res)=>{
  console.log(req.body.filename);
res.download("./uploads/"+req.body.filename+".pdf");
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server started o port ${PORT}`));
