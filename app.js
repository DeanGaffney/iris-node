var express = require('express');
var bodyParser = require('body-parser');
var request = require('request-promise');
const si = require('systeminformation');
const config = require('./config.json')
var app = express();

app.use(express.static(__dirname)).listen(process.env.PORT || 3000, function(){

});

app.use(bodyParser.json());

app.get('/system-info', function (req, res) {

});

function sendInfo(){
    var jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJwcmluY2lwYWwiOiJINHNJQUFBQUFBQUFBSlZTdjBcL2JRQlIrRG9rb1FpcFFpVW9NZENuZGtDUEJtS21ndEJLeVFrV2FoVXF0THZiREhKenZ6TjBaa2dWbGdpRURxQzFTSlZaR1wvaE5ZK2dkVVpXQmw3dHAzaHVEQWdyakpmdmY1K1wvVjhmZ01WbzJFeDFvd0w0NmNpaTduMFRhcTVqQTJHbWVhMjYyY0dkWVEyUjN6TWdTMmF3TzN4U3VBRlVPS1JoVmZCRnR0bFZjRmtYRjF0YjJGb2F4ME5DMHJIZDR3Ym1pVzRwXC9TMmY4OGRLbzBQQkFwcTc2d0VvK3N3eGNKUVpkSTJsS3gzVXE0eFdvZkpZaGFvY051TnBrTzZRV2s1RTJZWU9vcVN0UVZHQVl5enpHNHFVdVZvTEV6Y21zMHNGOVVtMmxvQUwxSm1ETGw3bEtScG5YVjM3MnhLU3JBRCsxRHVwQjRkNnU2ZGdcL3FPeDE5V1FsQnFycVNaYThsRVJYeURPM0hpNzgxK1wvMzEwMm11VkFLaVQrYWVcL0tlWXpTOUM3K1BydlRWNjBGMXA0UFdTOWdOVTZLYm1aS3BnXC9hM1RLZjM1OStuRnljXC9obGhKUWQ0c1B6OXpIM1wvcTY1N3JKS1VxYVpWVU03SXRxOXNuc204cVdueVFkYjZQcE5ucVFDNlkrU0ZxTjdpWUtZNHBhMUVvTytMWXl0clFiMWI2MW1mYzI5VlZpVWNFbWlMXC9QTWJsbCtvR2hWXC9ldmp5Nk8zZjRsZ0JTcTdUR1JJbFU4V29FYVd0RkVmbkpcL01qdis4NnVjQkJqXC96ZjFtZmFkb1FBd0FBIiwic3ViIjoiYWRtaW4iLCJyb2xlcyI6WyJST0xFX1VTRVIiXSwiZXhwIjoxNTIwNDI2NDM4LCJpYXQiOjE1MjA0MjI4Mzh9.D-Ky6RgRQZrbfd4I5W642cV2ymJXwlWSIUG-rVWBo3o';

    var postHeaders = { 'X-Auth-Token' : jwt};

    var endpoint = config.iris.agent.url;


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

    var ip
    var p5 = si.networkInterfaces().then(data => ip = data[0].ip4)
                                    .catch(error => console.log(error)); 

    Promise.all([p1, p2, p3, p4, p5]).then(values =>{
        console.log(ip);
        var options = {
            method: 'POST',
            uri: endpoint,
            headers: postHeaders,
            body: {
                osName: osName,            //String
                uptime: uptime,            //double
                cpuSpeedGHZ: cpuSpeedGHZ,  //float
                memTotal: 3,        //long
                memFree: memFree,          //long
                memUsed: memUsed,          //long
                cpuCurrentLoad: cpuCurrentLoad,          //double,
                ip: ip
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
