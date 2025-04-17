var http = require('http'); // 1 - 載入 Node.js 原生模組 http
var express = require('express')
var fs = require('fs')
var path = require('path')
const cors = require('cors');
const SocketServer = require('ws').Server
var app = express()
let sender

app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

const frontendPath = path.join(__dirname, '../quasar-project-frontend/dist/spa'); // Adjust path if needed
console.log(frontendPath)
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'), function (err) {
    if (err) res.status(404).send('File not found');
  });
});

app.use(express.static(path.join(__dirname,'public')));

app.get('/', (req, res) => {
  // console.log(req); 
  console.log(__dirname)
  res.sendFile(path.join(__dirname, '/public', 'sendSocket.html'), function(err) {
    if (err) res.send(404);
  });
});
app.get('/video', (req, res) => {
  console.log(__dirname); 
  res.sendFile('/video/video1.mp4', { root: __dirname }, function (err) { 
    if (err) { 
      console.log(err); 
    } else { 
        console.log('Sent:'); 
    } 
  })
});
app.post('/log', (req, res) => {
    const regex = /Samsung/i
    if( regex.test(req.body.userAgent)){
        // console.log(req.body);
    }
    
    console.log(req.body)
  res.send(`Got a POST request ${JSON.stringify(req.body)}`, );
});

app.post('/event', (req, res) => {
    console.log('/event', req.body);
    fileOperation(req.body)
    res.send(`Got a POST request ${JSON.stringify(req.body)}`, );
    
    res.status(200).send()
});

app.post('/send', (req, res) => {

  console.log(req.body.message)
  sender.send(JSON.stringify(req.body.message));
});

app.get('/vastData', (req, res) => {
  const params = req.query
  console.log(req.query.next_hour)

  const xml = '<?xml version="1.0"?><VAST version="3.0"><Ad id="17170:72995:173557:b8067b6a08899ed99f1d7673279127df:14801"><InLine><AdSystem version="2.0">CLICKFORCE</AdSystem><AdTitle>CLICKFORCE</AdTitle><Error/><Impression><![CDATA[https://ad.holmesmind.com/adserver/i?ut=1688629167&p=17170:72995:173557:b8067b6a08899ed99f1d7673279127df:14801]]></Impression><Impression><![CDATA[https://m.holmesmind.com/cm]]></Impression><Creatives><Creative sequence="1"><Linear><Duration>00:00:30</Duration><TrackingEvents><Tracking event="start"><![CDATA[https://ad.holmesmind.com/adserver/v?id=b8067b6a08899ed99f1d7673279127df-17170&duration=30&track=1]]></Tracking><Tracking event="firstQuartile"><![CDATA[https://ad.holmesmind.com/adserver/v?id=b8067b6a08899ed99f1d7673279127df-17170&duration=30&track=2]]></Tracking><Tracking event="midpoint"><![CDATA[https://ad.holmesmind.com/adserver/v?id=b8067b6a08899ed99f1d7673279127df-17170&duration=30&track=3]]></Tracking><Tracking event="thirdQuartile"><![CDATA[https://ad.holmesmind.com/adserver/v?id=b8067b6a08899ed99f1d7673279127df-17170&duration=30&track=4]]></Tracking><Tracking event="complete"><![CDATA[https://ad.holmesmind.com/adserver/v?id=b8067b6a08899ed99f1d7673279127df-17170&duration=30&track=5]]></Tracking></TrackingEvents><VideoClicks><ClickThrough><![CDATA[https://ad.holmesmind.com/adserver/c?p=17170:72995:173557:b8067b6a08899ed99f1d7673279127df:14801&dest=https%3A%2F%2Fwww.clickforce.com.tw%2F]]></ClickThrough></VideoClicks><MediaFiles><MediaFile id="1" delivery="progressive" type="video/mp4" width="1920" height="1080">                                             https://v.holmesmind.com/14801/video/output/l_ae5cb91227db1a81d673af13486e94e8.mp4                                        </MediaFile></MediaFiles></Linear></Creative></Creatives></InLine></Ad></VAST>'
  res.setHeader('Content-Type', 'application/xml');
  res.end(xml)
});
var server = app.listen(5000, function() {
    console.log('Node.js web server at port 5000 is running..');
}); //3 - 進入此網站的監聽 port, 就是 localhost:xxxx 的 xxxx

const wss = new SocketServer({
  port: 5555
});
wss.on('connection', function connection(ws) {
  sender = ws
})


let TIMES = 0
let todayDate = new Date().getDate()
function fileOperation (message){
  console.log('fileOperation')
  const today = new Date();
  const dateFormat = `${today.getMonth() + 1}${today.getDate()}`; // 获取当前日期，例如：0915
  if(todayDate != today.getDate()){
    TIMES = 0
  } else{
    TIMES++
  }
  

  // 构建文件名，例如：lineNotify_0915.txt
  const fileName = `LineNotify_Record_${dateFormat}.txt`

  // 定义文件路径
  const filePath = path.join('./', fileName);

  // 写入消息到文件
  fs.appendFile(filePath, `${TIMES}.\nmedia_id: ${message.media_id}.\n${message.pre_media_id}\n${message.errorType? message.errorType : '正常'}\n---------------------------------------------\n`, 'utf8', (err) => {
      if (err) {
          console.error(`写入文件 ${fileName} 出错：`, err);
      } else {
          console.log(`成功写入消息到文件 ${fileName}`);
      }
  });
}
