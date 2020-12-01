const express = require('express');
const app = express();
const router = express.Router();
const port = 3000;
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
const db = low(adapter);
const sche_db = low(schedule_adapter);


//server files in static folder at root URL '/'
app.use('/', express.static('static'));



router.use((req, res, next) =>{
    console.log('Request: ', req.method, ' Path: ', req.url, 'Time: ', Date.now());
    next();
})
router.use(express.json());

//1. get all courses subject and classnames
router.get('/courses', (req,res) =>{
	let subjects = db.get("courses").map("subject").value();
	let classNames = db.get("courses").map("className").value();
	let data = subjects.map(function(e, i){
		return {subject: e, description: classNames[i]};
	});
    res.send(data);
});

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

//for getting the start_time and end_time for a given course
function getTimes(course_info)
{
	let ret = [];
	for (i = 0; i < course_info.length; i++)
	{
		let times = {
			start_time: course_info[i][0].start_time, 
			end_time: course_info[i][0].end_time,
			days: course_info[i][0].days,
			component: course_info[i][0].ssr_component
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

