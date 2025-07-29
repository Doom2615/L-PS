const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const rateLimiter = require('express-rate-limit');
const compression = require('compression');

app.use(compression({
    level: 5,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept',
    );
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
//app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 100, headers: true }));
app.all('/player/register', function(req, res) {
    res.send("Coming soon...");
});
app.all('/player/login/dashboard', function (req, res) {
    const tData = {};
    try {
        const uData = JSON.stringify(req.body).split('"')[1].split('\\n'); const uName = uData[0].split('|'); const uPass = uData[1].split('|');
        for (let i = 0; i < uData.length - 1; i++) { const d = uData[i].split('|'); tData[d[0]] = d[1]; }
        if (uName[1] && uPass[1]) { res.redirect('/player/growid/login/validate'); }
    } catch (why) { console.log(`Warning: ${why}`); }

    res.render(__dirname + '/public/html/dashboard.ejs', {data: tData});
});

app.all('/player/growid/login/validate', (req, res) => {
    const growId = req.body.growId;
    const pass = req.body.password;
    const _token = req.body._token;
    const token = `_token=${_token}&growId=${growId}&password=${pass}`;
    res.send(
        `{"status":"success","message":"Account Validated.","token":"${token}","url":"","accountType":"growtopia", "accountAge": 2}`,
    );
});
app.all('/player/growid/checktoken', (req, res) => {
    const { refreshToken } = req.body;
    res.json({
        status: 'success',
        message: 'Account Validated.',
        token: refreshToken,
        url: '',
        accountType: 'growtopia',
        accountAge: 2
    });
});
app.get('/', function (req, res) {
   res.send('Hello Memek');
});

app.get('/public/cache/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'public', 'cache', filename);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Set appropriate headers for download
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.setHeader('Content-Type', 'application/octet-stream'); // Adjust for .rttex if known

    // Stream the file to handle large files
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      res.status(500).json({ error: 'Error streaming file' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Catch-all for 404 errors
app.use((req, res) => {
  res.status(404).send('Cannot GET ' + req.url);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});
