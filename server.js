//EXPRESS SERVER STUFF STARTS HERE
const express = require("express");
const app = express();
const cors = require("cors");
const moment = require('moment');

app.use(cors({ origin: true }));
app.use(express.static("public"));

//body parser code
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//SQLITE3 STUFF
const sqlite3 = require("sqlite3").verbose();

// open database in memory
let db = new sqlite3.Database("./database.db", sqlite3.OPEN_READONLY, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

app.post("/query/timeRangeAverage", function(request, response) {
  //console.log('0');
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let device_type = request.body.device_type;
  let device_floor = request.body.device_floor;
  var q_where = get_sql_where(device_type, device_floor, "");
  var mode = get_mode(device_type);
  var start = Date.now();
  let q = `SELECT ${mode} as value, device_floor as df, device_name as name FROM iotevents WHERE ${q_where} AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY device_name;`;
//  console.log('01');
  db.all(q, function(error, results) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);
      response.send(results);
    }
  });
});

app.post("/query/timeRangeSequence", function(request, response) {
//  console.log('1')
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let device_type = request.body.device_type;
  let device_floor = request.body.device_floor;
  let start_date = moment(startDate, "YYYY MM DD");
  let end_date = moment(endDate, "YYYY MM DD");
  // let duration = moment.duration(start_date.diff(end_date)).asDays();
  // can select only one device
  let device_name = request.body.device_name;
  var q_where = get_sql_where(device_type, device_floor, device_name);
  var mode = get_mode(device_type);
  var start = Date.now();
  //if only one day is being queried for, adds hour precision
  let format = get_time_range_format(startDate, endDate, device_type);
  let q = `SELECT strftime(${format}, log_time) as name, device_floor as df, ${mode} as value FROM 'iotevents' WHERE ${q_where}AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name;`;

  //let q = `SELECT strftime('%m-%d', log_time) as name, device_floor as df, ${mode} as value FROM 'iotevents' WHERE ${q_where}AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name;`;
  db.all(q, function(error, results) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);
      results = fill_out_results(startDate, endDate,device_type, results, '');

      response.send(results);
    }
  });
});

app.post("/query/timeCompareDT", function(request, response) {
//  console.log('2')
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let endDate = request.body.endDate;
  // get temperature data first
  var start = Date.now();
  let format = get_time_range_format(startDate, endDate, '');
  let q = `SELECT strftime(${format}, log_time) as name, device_type as dt, AVG (event_value) as avg_value, COUNT (*) as count_value FROM 'iotevents' WHERE event_type != 'temperature' AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name, dt;`;
  db.all(q, function(error, results_other) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      q = `SELECT strftime(${format}, log_time) as name, 'temperature' as dt, AVG (event_value) as avg_value FROM 'iotevents' WHERE event_type == 'temperature' AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name;`;
      db.all(q, function(error, results_temp) {
        console.log(q);
        if (error) {
          response.status(400).send("Error in database operation");
        } else {
          var results = results_other.concat(results_temp);
          var millis = Date.now() - start;
          console.log("speed for this is: ", millis);
          results = fill_out_results(startDate, endDate,device_type, results, '');

          response.send(results);
        }
      });
    }
  });
});

app.post("/query/timeCompareDF", function(request, response) {
//  console.log('3')
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let device_type = request.body.device_type;
  let device_floor = request.body.device_floor;
  var q_where = get_sql_where(device_type, device_floor, "");
  var mode = get_mode(device_type);
  var start = Date.now();
  let format = get_time_range_format(startDate, endDate, device_type);
  let q = `SELECT strftime(${format}, log_time) as name, device_floor as device_, ${mode} as value FROM 'iotevents' WHERE ${q_where} AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name, device_;`;
  db.all(q, function(error, results) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);

      results = fill_out_results(startDate, endDate,device_type, results, '');
      response.send(results);
    }
  });
});

app.post("/query/timeCompareDN", function(request, response) {
//  console.log('4')
  let startDate = request.body.startDate;
  let endDate = request.body.endDate;
  let device_type = request.body.device_type;
  let device_floor = request.body.device_floor;
  let device_name = request.body.device_name;
  let format = get_time_range_format(startDate, endDate, device_type);
  var q_where = get_sql_where(device_type, device_floor, device_name);
  var mode = get_mode(device_type);
  var start = Date.now();
  let q = `SELECT strftime(${format}, log_time) as name, device_name as device_, ${mode} as value FROM 'iotevents' WHERE ${q_where} AND log_time > '${startDate}' AND log_time < '${endDate}' GROUP BY name, device_;`;
  db.all(q, function(error, results) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);


      results = fill_out_results(startDate, endDate,device_type, results, device_name);
      //console.log(results);
      response.send(results);
    }
  });
});

app.post("/query/live/continuous", function(request, response) {
  var device_type = request.body.device_type;
  var q_where = get_sql_where(device_type, "", "");
  var start = Date.now();

  let q = `SELECT log_time as time, event_value as value, device_floor as df, device_name as name FROM "iotevents" where ${q_where} order by time desc LIMIT 1000`;
  db.all(q, function(error, results_raw) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);
      // the design of these queries is to ensure the speed for operation

      var exist_device_name = [];
      var results = [];
      for (var i = 0; i < results_raw.length; i++) {
        var dn = results_raw[i].name;
        if (!exist_device_name.includes(dn)) {
          exist_device_name.push(dn);
          results.push(results_raw[i]);
        }
      }
      response.send(results);
    }
  });
});

app.post("/query/live/binary", function(request, response) {
  var device_type = request.body.device_type;
  var q_where = get_sql_where(device_type, "", "");
  var start = Date.now();
  let q = `SELECT log_time as name, event_type as value, device_floor as df, device_name as dn FROM 'iotevents' WHERE ${q_where} order by name desc LIMIT 200;`;
  db.all(q, function(error, results) {
    console.log(q);
    if (error) {
      response.status(400).send("Error in database operation");
    } else {
      var millis = Date.now() - start;
      console.log("speed for this is: ", millis);
      response.send(results);
    }
  });
});
//checks for 1 day range and adjusts query to add hour precision in results
function get_time_range_format(startDate, endDate, type){
  let start_date = moment(startDate, "YYYY MM DD");
  let end_date = moment(endDate, "YYYY MM DD");
  let duration = moment.duration(end_date.diff(start_date)).asDays();
//  console.log(duration)
  // if(type === 'motion'){
  //   return '"%m-%d: %H %M %S"'
  // }
  if(duration<=1){
    return '"%Y-%m-%d: %H"'
  }
  return '"%Y-%m-%d"'
}

//this adds dummy data with value = 0 so that every hour is in the dataset
//for the hour to be graphed, one device with that hour log_time needs to be present
function fill_out_results(startDate, endDate, type, results, device){
//  console.log(results);
  let start_date = moment(startDate, "YYYY MM DD");
  let end_date = moment(endDate, "YYYY MM DD");
  let duration = moment.duration(end_date.diff(start_date)).asDays();
  let devices ={};
  // console.log(typeof startDate);
  // console.log('start_date: ', startDate);
  for(let x = 0; x<results.length; x +=1){
    let dev = results[x].device_
    if(!(dev in devices)){
      devices[dev] = results[x].value;
    }

  }
  console.log('device: ', device);
  let dummy = ''
  if(device === ''){
    if(type === 'temperature' || type === 'motion'){
      dummy = 'm1:169';
    }else if(type === 'outlet'){
      dummy = 'o1:coke';
    }else{
      dummy = 'd1:back';
    }
  }else{
    dummy = device;
  }
  console.log(dummy)
  let split_date = startDate.split('-');
  let dummy_base_empty_data = split_date[1] + '-' + split_date[2];

  if(results.length == 0){
    for(let j = 0; j<24; j+=1){
      let place_holder = j;
      if(place_holder<10){
        place_holder = "0" + j;
      }
      results.push({"name":dummy_base_empty_data +" "+ place_holder, "device_":dummy, "value":"0"})
    }
    return results;
  }
  //dummy = results[0].device_;
  if(duration<=1){

    //console.log(devices)

    let num_device = Object.keys(devices).length;
    // let dummy = results[0].device_;

    let dummy_base = results[0].name.split(" ", 2)[0];
    let counter = 00;
    let length = results.length
    if(!(type === 'temperature')){
      for(let i = 0; i<length; i+=1){
        let split = results[i].name.split(" ");
        let time = parseInt(split[1].split(":")[1], 10);
        let base = split[0]
        //if there is a time jump of more than 1 hour, this will fill in the
        //missing hours
        if(time > counter){
          for(let j=counter; j<=time; j+=1){
            let place_holder = j;
            if(place_holder<10){
              place_holder = "0" + j;
            }
            results.push({"name":base +" "+ place_holder, "device_":dummy, "value":"0"})
          }
          counter = time;

        }
        counter = time+1;
      }
      //if the last hour in results is not hour 24, this will fill in remaining
      //missing hours
      for(let j = counter; j<24; j+=1){
        let place_holder = j;
        if(place_holder<10){
          place_holder = "0" + j;
        }
        results.push({"name":dummy_base +" "+ place_holder, "device_":dummy, "value":"0"})
      }
    }

    //if it is temp data, adding 0s to the data doesnt make sense
    //instead, need to fill it with prev temp for each device at each hour
    else{
    //  console.log('else statement')
      let idx = 0;
      for(let time=0; time<24; time +=1){
    //    console.log(time);
        let present_devices = [];

      //  console.log('finding present devices')
        //console.log(parseInt(results[idx].name.split(" ", 2)[1]))
        while((idx < results.length) && parseInt(results[idx].name.split(" ", 2)[1]) === time){
        //  console.log('here');
          present_devices.push(results[idx].device_)
          devices[results[idx].device_] = results[idx].value
          idx += 1;
        }
        //console.log(present_devices);

        // console.log('found present devices')
        // console.log('num_devices: ', num_device);
        while(present_devices.length < num_device){
        //  console.log(present_devices.length)
          for(let curr_device in devices){
            //console.log(curr_device);

            if(!(curr_device in present_devices)){
              let value = devices[curr_device]
              let time_holder = time;
              if(time < 10){
                time_holder = '0' + time;
              }
              present_devices.push(curr_device);
              results.push({"name":dummy_base +" "+ time_holder, "device_":curr_device, "value": value})
            }
          }
        }
      }

    }
    return results;
  }else if(duration < 32){
  //  console.log('duration longer')
    if(!(type === 'temperature')){
      let curr_date = start_date;
      let curr_day = start_date.date;
      let idx = 0;
    //  console.log(duration)
      console.log(results);
      console.log('dummy: ', dummy);
      for(let i = 0; i<duration; i+=1){

        curr_day = curr_date.date;
        let obj_date = curr_date.toObject();
        let year = parseInt(obj_date.years);
        let day = parseInt(obj_date.date);
        let month = parseInt(obj_date.months) + 1;
      //  console.log(day)
    //    console.log('here');
        // console.log(idx);
        // console.log(parseInt(results[idx].name));
        console.log('this: ', parseInt(results[idx].name.split("-")[2]))
        console.log(parseInt(day))
        while((idx < results.length) && parseInt(results[idx].name.split("-")[2]) === day){
          // console.log('finding next day')
          idx += 1;
        }
    //    console.log('h1')
        console.log(idx, results.length);
        if(idx === results.length){
    //      console.log("h2");
          for(let y = i; y < duration; y+= 1){
            curr_date = curr_date.add(1, 'days');
            i+=1;
            obj_date = curr_date.toObject();
            year = obj_daye.years;
            day = obj_date.date;
            month = obj_date.months + 1;
      //      console.log(month +"-"+ day);
            console.log(year + '-' + month +"-"+ day, dummy)
            results.push({"name":year + '-' + month +"-"+ day, "device_":dummy, "value":"0"})

          }
          return results;
        }else{

    //    console.log('h3')
        curr_date = curr_date.add(1, 'days');
        obj_date = curr_date.toObject();
        year = parseInt(obj_date.years)
        day = parseInt(obj_date.date);
        month = parseInt(obj_date.months) + 1;
        i+=1;
        let next_day = parseInt(results[idx].name.split('-')[2]);
        let next_month = parseInt(results[idx].name.split('-')[1]);
        console.log('next day: ', next_day);
        console.log('next month: ', next_month);
        let first_day = parseInt(results[0].name.split('-')[2]);
        if(first_day === day){
          curr_date = curr_date.add(1, 'days');
          obj_date = curr_date.toObject();
          year = parseInt(obj_date.years)
          day = parseInt(obj_date.date);
          month = parseInt(obj_date.months) + 1;
          i+=1;
        }
        while(day!=next_day || month != next_month){
          console.log(day, next_day, month, next_month);
          if(month < 10){
            month = '0' + month
          }
          if(day < 10){
            day = '0' + day;
          }
          console.log('adding in between days');
          console.log(year + '-' + month +"-"+ day, dummy)
          //console.log(year + '-' + month +"-"+ day)
          results.push({"name": year + '-' + month +"-"+ day, "device_":dummy, "value":"0"})
          curr_date = curr_date.add(1, 'days');
          obj_date = curr_date.toObject();
          year = parseInt(obj_date.years)
          day = parseInt(obj_date.date);
          month = parseInt(obj_date.months) + 1;
          i+=1;
          // console.log('day month: ', day, month);
        }
      }

        //curr_date = curr_date.add(1, 'days');

      }

      //if the last hour in results is not hour 24, this will fill in remaining
      //missing hours
      return results;
    }
    else{
      let idx = 0;
      let curr_date = start_date;
      let curr_day = start_date.date;
      for(let day=0; day<duration; day +=1){
        // console.log(' ');
        // console.log(' ');
        // console.log(' ');
        // console.log(' ');
        // console.log(' ');
        //
        // console.log('start');

        curr_day = curr_date.date;
        let obj_date = curr_date.toObject();
        let day = obj_date.date;

        let present_devices = [];
        while((idx < results.length) && parseInt(results[idx].name.split("-", 2)[1]) === day){
          present_devices.push(results[idx].device_)
          devices[results[idx].device_] = results[idx].value
          idx += 1;
        }
        if(idx == results.length){
        //  console.log(day)
          for(let y = day; y < duration; y+= 1){
            curr_date = curr_date.add(1, 'days');

            obj_date = curr_date.toObject();
            day = parseInt(obj_date.date);
            month = parseInt(obj_date.months) +1;
            for(device in devices){
              results.push({"name":month +"-"+ day, "device_":device, "value": devices[device]})
            }

          }
          return results;
        }


        // console.log(devices);
        // console.log(present_devices);
        //console.log(present_devices);
        let num_device = Object.keys(devices).length;
        // console.log('found present devices')
        // console.log('num_devices: ', num_device);
        while(present_devices.length < num_device){
      //    console.log(present_devices.length)
          let month = (parseInt(obj_date.months) + 1)
          if(month<10){
            month = "0" + month;
          }else{
            month = month.toString();
          }
          if(day<10){
            day = "0" + day;
          }else{
            day = day.toString();
          }
          let dummy_date = month + '-' + day;
          for(let curr_device in devices){


            if(!(curr_device in present_devices)){

              let value = devices[curr_device]

              // console.log(dummy_date)
              present_devices.push(curr_device);
              results.push({"name": dummy_date, "device_":curr_device, "value": value})
            }
          }
        }
        curr_date = curr_date.add(1, 'days');
      }

    }
    //duration is greater than one day

  }
  return results
}

function get_sql_where(device_type, device_floor, device_name) {
  var q_where = null;
  if (device_type === "temperature") {
    q_where = `device_type!="web" and event_type="temperature"`;
  } else {
    q_where = `device_type="${device_type}" and event_type != "temperature" `;
  }
  if (device_name !== "") {
    q_where += ` and device_name="${device_name}" `;
  }
  if (device_floor !== "0" && device_floor !== "") {
    q_where += ` and device_floor="${device_floor}" `;
  }
  return q_where;
}

function get_mode(device_type) {
  var mode = "";
  // binary data uses sum
  if (device_type === "door" || device_type === "motion") {
    mode = "COUNT(*)/2";
  }
  // if(device_type === "motion"){
  //   mode = "COUNT(*)/2";
  //  mode = "log_time as time, event_type";
  //}
  // continuous data uses average
  if (device_type === "temperature" || device_type === "outlet") {
    mode = "AVG (event_value)";
  }
  return mode;
}

app.listen(8080);
