require('dotenv').config();
const express = require('express');
var stringSimilarity = require('string-similarity');
const app = express();
const router = express.Router();
const port = 3000;
const jwt = require('jsonwebtoken');
let allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Headers', "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
} 
app.use(allowCrossDomain);
app.use(express.json({ limit: 20000 }));
//setup the database
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('data/Lab3-timetable-data2.json');
const schedule_adapter = new FileSync('data/schedule.json');
const user_adapter = new FileSync('data/user.json');
const review_adapter = new FileSync('data/review.json');
const db = low(adapter);
const sche_db = low(schedule_adapter);
const user_db = low(user_adapter);
const rv_db = low(review_adapter);

//server files in static folder at root URL '/'
app.use('/', express.static('static'));



router.use((req, res, next) =>{
    console.log('Request: ', req.method, ' Path: ', req.url, 'Time: ', Date.now());
    next();
})
router.use(express.json());


//login verify
router.post('/login', (req, res) =>{
	const username = req.body.username;
	const user = {name: username};
	const password = req.body.password;
	const pwd = {pwd:password};
	console.log(user);
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
	res.json({accessToken:accessToken});
});

//non authenticated user
//3.b + 3.c search by combination
router.post('/open/courses', (req, res) =>{
	let subjectcode = req.body.subject;
	let catacode = req.body.catalog_nbr;
	if ((catacode) && (catacode[4])) catacode = catacode.slice(0,-1) + catacode[4].toUpperCase();
	if (Number(catacode)) catacode = Number(catacode);
	let data = [];
	let time = [];
	let courses = [];
	if (subjectcode && catacode)
		data = db.get("courses").filter({subject : subjectcode}).
		filter({catalog_nbr : catacode}).value();
	else if (!catacode)
		data = db.get("courses").filter({subject : subjectcode}).value();
	else
		data = db.get("courses").filter({catalog_nbr : catacode}).value();
	if (data.length > 0)
        res.send(data);
    else{
    	let msg = {msg: 'based on the given infomation, the course was not found'}
        res.status(404).send(msg);
    }
});

//3.c get reviews related to a course
router.post('/open/reviews', (req, res) =>{
	let subjectcode = req.body.subject;
	let catacode = req.body.catalog_nbr;
	if ((catacode) && (catacode[4])) catacode = catacode.slice(0,-1) + catacode[4].toUpperCase();
	if (Number(catacode)) catacode = Number(catacode);
	let data = [];
	let time = [];
	let courses = [];
	if (subjectcode && catacode)
		data = rv_db.get("reviews").filter({subject : subjectcode}).
		filter({catalog_nbr : catacode}).filter({visibility : "public"}).value();
	for (i = 0; i < data.length; i++)
	{
		let st = new Date(data[i].modified_time).toISOString();
		data[i].modified_time = st;
	}
	if (data.length > 0)
        res.send(data);
    else{
    	let msg = {msg: 'based on the given infomation, the review was not found'}
        res.status(404).send(msg);
    }
});
//3.d search by keywords
router.get('/open/search/:keyword', (req, res) =>{
	let keyword = req.params.keyword.split(' ').join('');
	let reg = new RegExp(keyword,"i");
	console.log(keyword);
	data = db.get("courses").value();
	let ret = [];
	for (i = 0; i < data.length; i++)
	{
		if (reg.test(data[i].className) || reg.test(data[i].catalog_nbr) || 
			stringSimilarity.compareTwoStrings(keyword, data[i].className) > 0.5 ||
			stringSimilarity.compareTwoStrings(keyword, (data[i].catalog_nbr.toString())) > 0.5)
			ret.push(data[i]);
	}
	if (ret.length > 0)
        res.send(ret);
    else{
    	let msg = {msg: 'based on the given infomation, the course was not found'}
        res.status(404).send(msg);
    }
});

//3.f List of public course lists (up to 10)
router.get('/open/schedules', (req, res) =>{
	let data = sche_db.value();
	let keys = Object.keys(data);
	let ret = [];
	for (i = 0; i < keys.length; ++i)
	{
		let sche = sche_db.get(keys[i]).value();
		if (sche[0].visibility == "public")
		ret.push(sche);
	}
	ret.sort(function(a,b){
		if (a[0].modified_time < b[0].modified_time)
			return 1;
		else return -1;
	})
	if (ret.length <= 10)
		res.send(ret);
	else
		res.send(ret.slice(0,10));
});


//authenticated user
//4.a create schedules
router.post('/secure/schedule', (req, res) =>{
	let schedulename = req.body.schedule_name;
	let existFlag = sche_db.get(schedulename).value();
	if (existFlag)
	{
		let msg = {msg : 'the given schedule name can not be created, because there is already a same schedule name existing' }
		res.status(400)
		.send(msg);
	} 
	else
	{
		let data =
		{
			"name": schedulename,		
  	  		"creator": user,
  	  		"modified_time": Date.now(),
  	  		"description": req.body.description,
  	  		"visibility": req.body.visibility
		}
		sche_db.set(schedulename, [data]).write();
		let msg = {msg: 'added successfully'}
		res.send(msg);
	}
});

//4.f edit a schedule
router.post('/secure/schedule/:schedulename', (req, res) =>{
	let schedulename = req.params.schedulename;
	let pairs = req.body.pairs
	let header = pairs[0];
	header.modified_time = Date.now();
	sche_db.set(schedulename,[header]).write();
	if (pairs.length > 1)
	{
		for (i = 1; i < pairs.length; i ++)
			{
				sche_db.get(schedulename).
				push({subject:pairs[i].subject,catalog_nbr:pairs[i].catalog_nbr,
					start_time:pairs[i].start_time,end_time:pairs[i].end_time,
					term:pairs[i].term,year:pairs[i].year}).write();
			}
	}
	let msg = {msg: 'edited successfully'}
	res.send(msg);
});

//4.g delete a schedule
router.delete('/secure/schedule/:schedulename', (req, res) =>{
	let schedulename = req.params.schedulename;
	let existFlag = sche_db.get(schedulename).value();
	if (!existFlag)
	{   
		let msg = {msg: 'the given schedule name was not found'}
		res.status(404)
		.send(msg);
	} 
	else
	{
		if (sche_db.get(schedulename).filter({creator:user}).value())
		{
			sche_db.unset(schedulename).write();
			let msg = {msg: "successfully delete schedule '" + schedulename + "'"};
		}
		else
		{
			let msg = {msg:"you are trying to delete someone else's schedule"};
		}
		res.send(msg);
	}
});

//4.h add a review for a course
router.post('/secure/review', (req, res) =>{
	let data =
		{
			"catalog_nbr": req.body.catalog_nbr,
	  		"subject": req.body.subject,
	  		"creator": user,
	  		"visibility": req.body.visibility,
	  		"modified_time": Date.now(),
	  		"content": req.body.content
		}
	rv_db.get("reviews").push(data).write();
	let msg = {msg: 'review added successfully'}
	res.send(msg);
});

//admin
//5.b grant privilige to other user
router.post('/admin/privilige/:username', (req, res) =>{
	let username = req.params.username;
	user_db.get("users").find({username:username}).assign({level:"admin"}).write();
	let msg = {msg: 'successfully set user ' + username + ' as a site manager'};
	res.send(msg);
});

//5.c change hidden flag for a review
router.post('/admin/review', (req, res) =>{
	let catacode = req.body.catalog_nbr;
	let subject = req.body.subject;
	let time = req.body.modified_time;
	let flag = req.body.flag;
	rv_db.get("reviews").filter({catalog_nbr:catacode}).filter({subject:subject}).find({modified_time:time}).
	assign({visibility:flag}).write();
	let msg = {msg: "edited visibility to " + flag + " successfully"};
	res.send(msg);
});

//5.d change status for a user 
router.post('/admin/userstatus/:username', (req, res) =>{
	let username = req.params.username;
	let flag = req.body.flag;
	user_db.get("users").find({username:username}).assign({status:flag}).write();
	let msg = {msg: "edited status to " + flag + " successfully"};
	res.send(msg);

});

//token authentication
function authenticateToken(req, res, next){
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		console.log(user);
		next(); 
	})
}


//1. get all courses subject and classnames
router.get('/courses', (req,res) =>{
	let subjects = db.get("courses").map("subject").value();
	let classNames = db.get("courses").map("className").value();
	let data = subjects.map(function(e, i){
		return {subject: e, description: classNames[i]};
	});
    res.send(data);
});
/*
//2. get all courses codes for a given subject
router.get('/courses/:subject', (req, res) =>{
    let subjectcode = req.params.subject;
    let courses = [];
    courses = db.get("courses").filter({subject : subjectcode}).map("catalog_nbr").value();
    let data = courses.map(function(e){
		return {codes: e};
	});
    if (data.length > 0)
        res.send(data);
    else{
    	let msg = {msg: 'the given subject code was not found'}
        res.status(404).send(msg);
    }
});

//3. get the time table entry witchout a component code
router.get('/courses/:subject/:catalog_nbr', (req, res) =>{
	let subjectcode = req.params.subject;
	let catacode = req.params.catalog_nbr;
	let courses = [];
	let time = [];
	if (catacode != 'any')
	{
		if (Number(catacode)) catacode = Number(catacode);
		courses = db.get("courses").filter({subject : subjectcode}).
		filter({catalog_nbr : catacode}).map("course_info").value();
	}
	else
		courses = db.get("courses").filter({subject : subjectcode}).
		map("course_info").value();
	if (courses.length > 0)
        res.send(getTimes(courses));
    else{
    	let msg = {msg: 'the given subject code was not found'}
        res.status(404).send(msg);
    }
});

//3. get the time table with a component code
router.get('/courses/:subject/:catalog_nbr/:ssr_component', (req, res) =>{
	let subjectcode = req.params.subject;
	let catacode = req.params.catalog_nbr;
	if (Number(catacode)) catacode = Number(catacode);
	let componentcode = req.params.ssr_component;
	let data = [];
	let time = [];
	let courses = [];
	console.log(subjectcode,catacode,componentcode);
	data = db.get("courses").filter({subject : subjectcode}).
	filter({catalog_nbr : catacode}).map("course_info").value();
	for (i = 0; i < data.length; i++)
	{
		let course = data[i][0];
		console.log(course);
		if (course.ssr_component == componentcode)
			courses.push(course);
	}
	console.log(courses);
	if (courses.length > 0)
        res.send(getTimesForComponent(courses));
    else{
    	let msg = {msg: 'based on the given infomation, the course was not found'}
        res.status(404).send(msg);
    }
});

//4. create a schedule with a given name
router.post('/schedule', (req, res) =>{
	let schedulename = req.body.schedule_name;
	let existFlag = sche_db.get(schedulename).value();
	if (existFlag)
	{
		let msg = {msg : 'the given schedule name can not be created, because there is already a same schedule name existing' }
		res.status(400)
		.send(msg);
	} 
	else
	{
		sche_db.set(schedulename, []).write();
		let msg = {msg: 'added successfully'}
		res.send(msg);
	}
});

//5. Save a list of subject code, course code pairs under a given schedule name
router.post('/schedule/:schedule_name', (req, res) =>{
	let schedulename = req.params.schedule_name;
	let pairs = req.body.pairs;
	let existFlag = sche_db.get(schedulename).value();
	if (!existFlag)
	{
		let msg = {msg: 'the given schedule name was not found'}
		res.status(404)
		.send(msg);
	} 
	else
	{
		for (i = 0; i < pairs.length; i ++)
		{
			if (sche_db.get(schedulename).find({subject:pairs[i].subject}).value())
			{
				sche_db.get(schedulename).find({subject:pairs[i].subject})
				.assign({catalog_nbr:pairs[i].catalog_nbr}).
				assign({start_time:pairs[i].start_time}).assign({end_time:pairs[i].end_time}).write();
			}
			else
			{
				sche_db.get(schedulename).
				push({subject:pairs[i].subject,catalog_nbr:pairs[i].catalog_nbr,start_time:pairs[i].start_time,end_time:pairs[i].end_time}).write();
			}
		}
		let data = sche_db.get(schedulename).value();
		res.send(data);
	}
});

//6. Get the list of subject code, course code pairs for a given schedule
router.get('/schedule/:schedule_name', (req, res) =>{
	let schedulename = req.params.schedule_name;
	let existFlag = sche_db.get(schedulename).value();
	if (!existFlag)
	{
		let msg = {msg: 'the given schedule name was not found'}
		res.status(404)
		.send(msg);
	} 
	else
	{
		let data = sche_db.get(schedulename).value();
		res.send(data);
	}
});

//7. delete a schedule for a given schedule name
router.delete('/schedule/:schedule_name', (req, res) => {
	let schedulename = req.params.schedule_name;
	let existFlag = sche_db.get(schedulename).value();
	if (!existFlag)
	{
		let msg = {msg: 'the given schedule name was not found'}
		res.status(404)
		.send(msg);
	} 
	else
	{
		sche_db.unset(schedulename).write();
		let msg = {msg: "successfully delete schedule '" + schedulename + "'"}
		res.send(msg);
	}
});

//8. return the numbers of courses for schedules
router.get('/schedule', (req, res) =>{
	let data = sche_db.value();
	let keys = Object.keys(data);
	let ret = []
	for (i = 0; i < keys.length; ++i)
	{
		ret.push({schedule:keys[i],count:(sche_db.get(keys[i]).value().length == null) ? 0 : sche_db.get(keys[i]).value().length});
	}
	res.send(ret);
});

//9. delete all schedules
router.delete('/schedule', (req, res) => {
	let data = sche_db.value();
	let keys = Object.keys(data);
	for (i = 0; i < keys.length; ++i)
	{
		sche_db.unset(keys[i]).write();
	}
	let msg = {msg: "deleted all schedules successfully"};
	res.send(msg);
});
*/
//for getting the start_time and end_time for a given course
function getTimes(course_info)
{
	let ret = [];
	for (i = 0; i < course_info.length; i++)
	{
		let times = {
			start_time: course_info[i].start_time, 
			end_time: course_info[i].end_time,
			days: course_info[i].days,
			component: course_info[i].ssr_component
		};
		ret.push(times);
	}
	return ret;
}

//same with above but is used when having a componenet code
function getTimesForComponent(course_info)
{
	let ret = [];
	for (i = 0; i < course_info.length; i++)
	{
		let times = {
			start_time: course_info[0].start_time, 
			end_time: course_info[0].end_time,
			days: course_info[0].days,
			component: course_info[0].ssr_component
		};
		ret.push(times);
	}
	return ret;
}


app.use('/api',router);

app.listen(port, () => console.log('Listening on port 3000 ...'));

