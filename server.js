if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express');
const ejs = require("ejs");
const fetch = require("node-fetch");
const PORT = 8000 || process.env.PORT;
const URI = `http://localhost:${PORT}`;
const mongoURI = process.env.DB_URI;
const mongoose = require('mongoose');
const User = require('./models/User');
const FormData = require('form-data');

const Projects = require('./models/project');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const bodyParser = require("body-parser");
var fs = require('fs');
var path = require('path');
var multer = require('multer');

const app = express();

app.use(express.static("public"));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({
    extended : true
}));

// .then(response => console.log(response.json()));

app.use(session({
    secret:"our little scre",
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize());
app.use(passport.session());
// mongoose.set("strictQuery", false);

mongoose.connect("mongodb://localhost:27017/userData",{useNewUrlParser:true,})
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
// Passport

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
 
var storages = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'prouploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
var upload = multer({ storage: storage });
var uploads = multer({ storage: storages });

const passportConfig = async () => {
	passport.use(
		new LocalStrategy(
			{ usernameField: 'email' },
			async (emails, password, done) => {
				try {
					const user = await User.findOne({ emails });
					// console.log(user)
					if (!user) {
						return done(null, false, { message: 'Authentication Error' });
					}
					const isMatch = await bcrypt.compare(password, user.password);
					if (!isMatch) {
						return done(null, false, { message: 'Authentication Error' });
					}
					// if (!user.emailVerified) {
					// 	return done(null, false, { message: 'Please Verify your Email' });
					// }
					return done(null, user);
				} catch (e) {
					return done(e);
				}
			}
		)
	);
	passport.serializeUser((user, done) => {
		return done(null, user._id);
	});
	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			return done(err, user);
		});
	});
};
passportConfig();
app.use(
	session({
		resave: false,
		saveUninitialized: false,
		secret: process.env.SESSION_SECRET,
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});





app.get('/', (req, res) => {
	res.render("home")
});

app.get('/register', (req, res) => {
	// res.render('register');
	User.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('register', { items: items });
        }
    });
});

app.get('/voice', (req, res) => {
	// res.render('register');
	User.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('voice', { items: items });
        }
    });
});
const createTokenAndSend = async user => {
	const secret = 'i lkike to play';
	const payload = {
		user: user._id,
	};
	jwt.sign(payload, secret,{expiresIn:'60000'} , async (err, token) => {
		if (err) {
			return 'error';
		}
		const html = `<a href=${URI}/verify/${payload.user}/${token}>Verify Your Email</a>`;
		// Mail options
		const transporter = nodemailer.createTransport({
			host : 'smtp.gmail.com',
            port : 587,
            secure : false,
            requireTLS : true,
            auth :{
                user : 'silentdude7829@gmail.com',
                pass : 'maydixykfidjncqe',                
            }
		});

		let mailOptions = {
			from: 'silentdude7829@gmail.com',
			to: user.email,
			subject: 'Email Confirmation Request',
			text: 'Verify Email',
			html: html, // URL For Confirmation
		};
		
		try {
			const info = await transporter.sendMail(mailOptions);
			return 'success';
		} catch (e) {
			return 'error';
		}
	});
};
const checkAuthentication = (req, res, next) => {
	if (req.isAuthenticated()) {
		next();
	} else {
		req.flash('error', 'You are not logged in');
		res.redirect('/login');
	}
};

// app.get('/secrets', checkAuthentication, (req, res) => {
// 	const { email, name,  } = req.user;
// 	res.json({
// 		user: {
// 			email,
// 			name,
			
// 		},
		
// 	});
// 	// res.render("secrets")
// 	// logout: `${URI}/logout`,
// });
app.get("/secrets",checkAuthentication,(req , res)=>{
	// const project = new Project(req.body.project);

	if(req.isAuthenticated()){
		var id = req.user.id;
		//  console.log(id);
			// User.findOne({_id: id}, function (err, user) {
			// 	if(!err){
			// 		console.log("data called");
			// 		res.render('secrets',{ users: user });
			// 		console.log(user)
			// 		}
			// 		else{
			// 			console.log(err);
			// 		}
			// 	  });

 
  Projects.find({}, function (err, project) {
	//     // if (err) return res.json(400, {message: `user ${id} not found.`});
	
	//     // make sure you omit sensitive user information 
	//     // on this object before sending it to the client.
		// res.json(user.email)
		if(!err){
		console.log("data called");
		res.render('secrets',{ projects: project });
		// console.log(project)
		}
		else{
			console.log(err);
		}
	  });
}

else{
	res.redirect("/login")
}
// Projects.find({}, function (err, project) {
//     // if (err) return res.json(400, {message: `user ${id} not found.`});

//     // make sure you omit sensitive user information 
//     // on this object before sending it to the client.
// 	// res.json(user.email)
// 	if(!err){
// 	console.log("data called");
//     res.render({ projects: project });
// 	}
// 	else{
// 		console.log(err);
// 	}
//   });
})

app.get("/profile",checkAuthentication,(req , res)=>{
    if(req.isAuthenticated()){
		var id = req.user.id;
		var pro = req.user.pro_id;
		// console.log(pro);
		// console.log(id);

  User.findOne({_id: id}, function (err, user) {
    if (err) return res.json(400, {message: `user ${id} not found.`});

    // make sure you omit sensitive user information 
    // on this object before sending it to the client.
	// res.json(user.email)
    if(!err){
		
			res.locals.users = user;
			console.log(res.locals.users);
    // return next();
	}

  });
  			
			
  let i = 0;
  while(i < pro.length ){
	  var temp = pro[i];
	//   console.log(temp)
	  Projects.findById(temp, function (err, item) {
		  if (err) return res.json(400, {message: `user ${id} not found.`});
	  		  if(!err){
				res.locals.projects = item;
				console.log(res.locals.projects)
			  }
		});
		i++;
  }
  res.render("profile")
    }
    else{
        res.redirect("/login")
    }
	
})

var ruser = ""
var rtype = ""
app.get("/regdata", (req, res) => { 
    var data = { // this is the data you're sending back during the GET request 
        data1: ruser, 
        data2: rtype
    } 
    res.status(200).json(data) 
}); 

// This function handles the registration of a user
app.post('/register', upload.single('user[image]'), async (req, res) => { 
    // Create a new user from req.body 
    const user = new User(req.body.user); 
    
    // Generate and Hash Password using bcrypt 
    user.password = await bcrypt.hash(user.password, 10); 
    
    //Read and store image file sent in request 
    user.image= { 
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
        contentType: 'image/png' 
    } 
    
    // Save User data to database 
    try { 
        await user.save();
        // Create and Send Email Verification Token 
        // await createTokenAndSend(user);
        // Display Success Message on Client Side 
        req.flash('success', 'Successfully Registered, Email Sent');
		
		
		ruser=user.emails;
		rtype = 'register';
        res.redirect('http://127.0.0.1:5000/reg');
    } catch (e) {
        // Display Error Message for Already Used Email ID 	
        req.flash('error', 'Email already regitered');
        // Log exceptions/errors 
        console.log(e);
        // Redirect back to the registration page
        res.redirect('/register');
    }
});	


app.post('/project',uploads.single('project[image]'), async (req, res) => {
	const project = new Projects(req.body.project);
	var vid = req.user.id;
     console.log(vid);
	project.image= {
		data: fs.readFileSync(path.join(__dirname + '/prouploads/' + req.file.filename)),
		contentType: 'image/png'
	}
	try {
		await project.save();
		var proid = project._id;
		console.log(proid);
		// console.log("saved");
		User.findOne({_id: proid}, function (err, user) {
			if (err) return res.json(400, {message: `user ${id} not found.`});
		
			// make sure you omit sensitive user information 
			// on this object before sending it to the client.
			// res.json(user.email)
			if(!err){
			User.findOneAndUpdate(
				{ _id: vid }, 
				{ $push: { pro_id: proid  } },
			   function (error, success) {
					 if (error) {
						 console.log(error);
					 } else {
						 console.log(success);
					 }
				 });
				}			
		  });
		req.flash('success', 'Project Posted');
		res.redirect('/secrets');
	} catch (e) {
console.log(e);
		res.redirect('/project');
	}
});

app.get("/project",checkAuthentication,(req , res)=>{
    if(req.isAuthenticated()){
		var id = req.user.id;
		// console.log(id);

  User.findOne({_id: id}, function (err, user) {
    if (err) return res.json(400, {message: `user ${id} not found.`});

    // make sure you omit sensitive user information 
    // on this object before sending it to the client.
	// res.json(user.email)
    res.render('project', { users: user });
  });
				

    
    }
    else{
        res.redirect("/login")
    }
})
app.get('./templates/index', (req, res) => {
	res.render('index');
});
app.get('/login', (req, res) => {
	res.render('login');
	
	
});


var luser = ""
var ltype = ""
app.get("/getdata", (req, res) => { 
    var data = { // this is the data you're sending back during the GET request 
        data1: luser, 
        data2: ltype
    } 
    res.status(200).json(data) 
}); 



app.post(
	'/login',
	passport.authenticate('local', {
		 successFlash: true,
		 failureFlash: true,
		// successRedirect: 'http://127.0.1:5000/home',
		 failureRedirect: '/login',
	}),
	(req, res) => {
		luser = req.body.email;
		console.log(luser)
		ltype = 'login'
		console.log(req.body.email)
		
		res.redirect('http://127.0.0.1:5000/home')
		 //Here will be my code to check detail wrong or right
	}
	
	
);
   
app.get('/logout', (req, res) => {
	req.logOut();
	req.flash('success', 'Successfully Logged out');
	res.redirect('/login');
});

app.get('/verify/:user/:token', async (req, res) => {
	try {
		let user = await User.findById(req.params.user);
		if (!user) {
			req.flash('error', 'Invalid Request');
			return res.redirect('/register');
		}
		if (user.emailVerified) {
			req.flash('success', 'Email already Verified');
			return res.redirect('/login');
		}
		const secret = 'i lkike to play';
		jwt.verify(req.params.token, secret, async (err, decoded) => {
			if (err) {
				console.log(err)
				req.flash('error', 'Email Verification Token Expired');
				return res.redirect('/login');
			}
			user.emailVerified = true;
			await User.findByIdAndUpdate(user._id, user);
			await user.save();
			req.flash('success', 'Email Verified');
			return res.redirect('/login');
		});
	} catch (e) {
		res.json({
			msg: e,
		});
	}
});

app.post('/verify/resend', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			req.flash('error', 'Email not Registered');
			return res.redirect('/login');
		}
		await createTokenAndSend(user);
		req.flash('success', 'Successfully Registered, Email Sent');
		res.redirect('/login');
	} catch (e) {
		req.flash('errorr', 'Server Error');
		res.redirect('/login');
	}
});

app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});
