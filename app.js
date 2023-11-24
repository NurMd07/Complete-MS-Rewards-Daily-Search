const express = require('express');
const app = express();
const axios = require('axios');
const useragent = require('express-useragent')
const data = require('./public/all.json');
const fs = require('fs');
require('dotenv').config();

app.disable('x-powered-by');

app.use(express.urlencoded({ extended: false }));

app.use(express.static('public', { maxAge: '1d' }));


app.set('view engine','ejs');
app.set('trust proxy', true);


app.get('/',async(req,res)=>{



 res.set('Content-Type', 'text/html');  
let source = req.headers['user-agent']
let ua,isMobile;
try{
  ua = useragent.parse(source);
  isMobile = ua.isMobile;
if(isMobile==undefined){
throw new Error("oops");
}
}catch(e){
console.log(e); 
  isMobile = false;;
}
// get ip info
let ip;
if(req.ip.length>=6 && !(req.ip.includes('192.168'))){
  ip = req.ip;
}else{
  ip = '1.1.1.1';
  
}

try{
  
 let ipinfo = await axios.get(`http://ip-api.com/json/${ip}?fields=countryCode`);

if(!ipinfo.data || !ipinfo.data.hasOwnProperty('countryCode')){
  res.render('home',{country_code:'unavailable',isMobile:isMobile});
  throw new Error('ipinfo error');
}

 let country_code = ipinfo.data.countryCode;

 res.render('home',{country_code:country_code,isMobile:isMobile});


}catch(err){
  res.render('home',{country_code:'Error',isMobile:isMobile});
console.log(err);

return;
}


})

app.get('/word',(req,res)=>{
 try{
  if(req.query.hasOwnProperty('number')&& !isNaN(req.query.number)){
    let number = Math.floor(Math.abs(req.query.number));
  let array = [];

   if(number>0 && number<=100){
    while(number>0){
      let random = Math.floor(Math.random()*data.length);
      array.push(data[random]);
    number--;
    }
    res.status(200).json(array);
   }else{
    res.status(400).json('number is not in range');
   }
   }else{
    res.status(400).json('400 Bad Request');
  }
}catch(err){
  console.log(err);
  res.status(500).send('500 Internal Server Error');
}
})

app.post('/contactus',(req,res)=>{
 
  res.send('OK');

const {name,subject,email,message} = req.body;
if(!name || !subject || !email || !message){
  return;
}
  const formData = {
    name: name,
    subject: subject,
    email: email,
    message: message,
  };
try{
  const writeToJSONFile = (data, filePath) => {
    fs.readFile(filePath, 'utf-8', (readError, fileContent) => {
      if (readError && readError.code !== 'ENOENT') {
        console.error('Error reading file:', readError.message);
        return;
      }
  
      let existingData = [];
      if (fileContent) {
        existingData = JSON.parse(fileContent);
      }
  
      existingData.push(data);
  
      const jsonData = JSON.stringify(existingData, null, 2);
  
      fs.writeFile(filePath, jsonData, 'utf-8', (writeError) => {
        if (writeError) {
          console.error('Error writing to file:', writeError.message);
        }
      });
    });
  };
  
  const jsonFilePath = 'contactus.json';
  
  writeToJSONFile(formData, jsonFilePath);
  
}catch(e){
  console.log(e);
}

})
app.get('/contact',(req,res)=>{
  res.render('contactus');
})
app.get('/about',(req,res)=>{

res.render('about');

})

app.use((req, res, next) => {
  res.status(404).render('404');
});



app.listen(9002,(err)=>{
    if(err){
      console.log(err);
      return;
    }
    console.log('Server is Started');
})
