const http = require('http');
const jwt = require('jsonwebtoken');
const secretKey = 'oty5Km/C4h6/OwpgqL4FdyI55RydU8glFRFCxiNFoLFb4UpZXtUV1VlDC34KFmDK';
var fs = require('fs'),
    path = require('path'),
    filePath = path.join(__dirname, 'index.html');
const server = http.createServer((req, res) => {
    // if you run the client from sth like file:///C:/nodejs/10httonlyCookie1/index.html
    // it would mean HTML file is being served via the file:// protocol directly from your filesystem rather than over HTTP or HTTPS.
    console.log('Request origin:', req.headers.origin);
    res.setHeader('Access-Control-Allow-Origin', '*');// Adjust the port if necessary
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        // Preflight request automatically sends by browser for many reasons
        res.writeHead(204);//success with no content to return to the client
        res.end();
        return;
    }
    /*\ /login */
    if (req.url === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convert Buffer to string
        });
        req.on('end', () => {
            try {
                const user = JSON.parse(body); // Parse the JSON body
                if (user.username === 'admin' && user.password === '111') {

                    const token = jwt.sign({username: "admin"}, secretKey, {expiresIn: '1h'});
                    console.log(token);
                    res.writeHead(200, {
                        'Set-Cookie': `token=${token}; HttpOnly;Max-Age=60 `,
                        'Content-Type': 'application/json',
                    });

                    res.end(JSON.stringify({ message: 'Logged in successfully' }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Unauthorized' }));
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Bad Request: Invalid JSON' }));
            }
        });
        /*\ /something */
    } else if (req.url === '/something' && req.method === 'GET') {
        // Check if the user is logged in by checking the cookie
        const cookies = req.headers.cookie.split(";");
        let tokenRecieved;
        console.log("cookies " + cookies);
        for (const i in cookies) {
            console.log("cookie " + cookies[i]);
            if (cookies[i].trim().substring(0, 6) === "token=") {
                console.log("i: " + cookies[i]);
                tokenRecieved = cookies[i].trim().replace("token=","");
                break;
            }
        }
        console.log("token recieved: " + tokenRecieved);
        try {
            const decoded = jwt.verify(tokenRecieved, secretKey);
            // req.user = decoded;
            // console.log("User: " + user);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ treasure: "This is a stupid treasure"}));
        } catch (err) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Unauthorized: You are not logged in.' }));
            console.log(err);
        }
    } else if (req.url === '/' && req.method === 'GET') {
        fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
            if (!err) {
                console.log('received data: ' + data);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            } else {
                console.log(err);
            }
        });
    }  else {
        // For any other route, return 404 not found
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('404 Not Found');
    }
});
server.listen(3000, () => {
    console.log('Server running on port 3000');
});//**  Generated mostly by chatGPT ver. 4 **/