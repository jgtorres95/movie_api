// Import Modules
const http = require('http'),
    fs = require('fs');
    url = require('url');
// Create server that receives request from client and sends back a response
http.createServer((request, response) => {
    let addr = request.url;
    let q = url.parse(addr, true); // Parse request
    filePath = '';

    // Log recent requests to log.txt
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);        
        } else {
            console.log('Added to log.'); 
        }
    });

    // Check whether pathname include 'documentation' and return documentation.html. Otherwise, return index.html.
    if (q.pathname.includes('documentation')) {
        filePath = (__dirname + '/documentation.html'); 
    } else {
        filePath = 'index.html'; 
    }

    // read filePath, otherwise return error.
    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err; 
        }

        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
    })

}).listen(8080);
console.log('My test server is running on Port 8080');