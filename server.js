var http = require("http");
var express = require('express');
var pg = require('pg');
var app = express();
var outputString = "";

app.engine('html', require('ejs').renderFile);
var dbhost = process.env.RDS_HOSTNAME,
    dbuser = process.env.RDS_USERNAME,
    dbpassword = process.env.RDS_PASSWORD,
    dbport = process.env.RDS_PORT;

//[2] Get database connection data
app.locals.connectionerror = 'not_opened';
// my injection style on OpsWorks manually
app.locals.DB_URL = process.env.DB_URL;
app.locals.databases = '';

//Elastic Beanstalk type of env injection:
if (dbhost != null) {
    //postgres://postgres:postgres2@localhost:5433/editorial
    app.locals.DB_URL = 'postgres://' + dbuser + ':' + dbpassword + '@' + dbhost + ':' + dbport + '/postgres';
}

console.log('db_url is: ' + app.locals.DB_URL);

//[3] Connect to the Amazon RDS instance

pg.connect(app.locals.DB_URL, function(err, client, done) {
    if(err) {
        app.locals.connectionerror = err.stack;
        return console.error('error fetching client from pool', err);
    }
    app.locals.connectionerror = 'successful';

    client.query('SELECT $1::int AS number', ['1'], function(err, result) {
        //call `done()` to release the client back to the pool
        done();

        if(err) {
            return console.error('error running query', err);
        }
        app.locals.databases = result.rows[0].number + "";
        console.log(result.rows[0].number);
        //output: 1
    });
});
/*
connection.connect(function(err)
{
    if (err) {
        app.locals.connectionerror = err.stack;
        return;
    }
    app.locals.connectionerror = 'successful';
});

// [4] Query the database
connection.query('SHOW DATABASES', function (err, results) {
    if (err) {
        app.locals.databases = err.stack;
    }

    if (results) {
        for (var i in results) {
            outputString = outputString + results[i].Database + ', ';
        }
        app.locals.databases = outputString.slice(0, outputString.length-2);
    }
});

connection.end();
 */

app.get('/', function(req, res) {
    res.render('./index.html');
});

app.use(express.static('public'));

//[5] Listen for incoming requests
app.listen(process.env.PORT || 3000);
/*
http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
    console.log('adi got request');
}).listen(process.env.PORT || 8888);
*/
console.log('adi server started on port: ' + (process.env.PORT || 8888));