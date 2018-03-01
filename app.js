var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');
const si = require('systeminformation');
var app = express();

app.use(express.static(__dirname)).listen(3000, function(){

});

app.use(bodyParser.json());

app.get('/system-info', function (req, res) {

});

function sendInfo(){
    var endpoint = '';

    var agentOptions = {
        method: 'POST',
        uri: 'http://ec2-52-16-53-220.eu-west-1.compute.amazonaws.com:8080/iris/schema/getAgentUrl',
        body: {
            name: 'node_agent'
        },
        json: true      // JSON stringifies the body automatically
    }

    var uriP = request(agentOptions)
    .then(function(response){
       endpoint = response.url;
       console.log(endpoint);
    })
    .catch(function(err){
        console.log(err);
    });

    var uptime = si.time().uptime;

    var cpuSpeedGHZ;           //cpu speed in GHZ
    var p1 = si.cpu().then(data => cpuSpeedGHZ = data.speed)
            .catch(error => console.log(error));

    var memTotal;
    var memFree;
    var memUsed;
    var p2 = si.mem().then(function(data){
        memTotal = data.total;
        memFree = data.free;
        memUsed = data.used;
    })
    .catch(error => console.log(error));

    var cpuCurrentLoad;
    var p3 = si.currentLoad().then(data => cpuCurrentLoad = data.currentload)
                    .catch(error => console.log(error));

    var osName
    var p4 = si.osInfo().then(data => osName = data.distro + ' ' + data.release)
                        .catch(error => console.log(error));

    Promise.all([uriP, p1, p2, p3, p4]).then(values =>{
        var options = {
            method: 'POST',
            uri: endpoint,
            body: {
                osName: osName,            //String
                uptime: uptime,            //double
                cpuSpeedGHZ: cpuSpeedGHZ,  //float
                memTotal: 3,        //long
                memFree: memFree,          //long
                memUsed: memUsed,          //long
                cpuCurrentLoad: cpuCurrentLoad          //double
            },
            json: true      // JSON stringifies the body automatically
        }

        request(options)
        .then(function(response){
            console.log(response);
        })
        .catch(function(err){
            console.log(err);
        });
    });

}

setInterval(sendInfo, 5000);

function printInfo(){
    var uptime = si.time().uptime;

    var cpuSpeedGHZ;           //cpu speed in GHZ
    var p1 = si.cpu().then(data => cpuSpeedGHZ = data.speed)
            .catch(error => console.log(error));

    var memTotal, memFree, memUsed;     //total in bytes, free in bytes
    var p3 = si.mem().then(function(data){
        memTotal = data.total;
        memFree = data.free;
        memUsed = data.used;
    })
    .catch(error => console.log(error));

    var cpuCurrentLoad;     //current cpu load in %
    var p4 = si.currentLoad().then(data => cpuCurrentLoad = data.currentload)
                    .catch(error => console.log(error));

    Promise.all([p1, p3, p4]).then(values =>{
        console.log("Cpu Speed: " + cpuSpeedGHZ + "\n" +
                    "Memory Total: " + memTotal + "\n" +
                    "Memory Free: " + memFree + "\n" +
                    "Memory Used: " + memUsed + "\n" +
                    "Cpu Current Load: " + cpuCurrentLoad + "\n");
    });
}
//setInterval(printInfo, 5000);
