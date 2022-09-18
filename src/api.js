const express = require("express");
const serverless = require("serverless-http");


const {create: createYoutubeDl} = require('youtube-dl-exec')
// importing the dependencies
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const youtubedl = createYoutubeDl('./yt-dlp')


const app = express();


// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));



const fun=async (res, yturl)=>{
  

  if(yturl.includes("/?v=")){
  const get_only_url=yturl.replace("/?v=","") // gets the youtube link

  let audio_source={url:"", title:""}
  await youtubedl(get_only_url,{'format': 'bestaudio',
             skipDownload: true,
             dumpSingleJson: true,}).then(output=>{
              // console.log(output)
              // text=res.send(output)
              formats=output['formats']
              audio_source["url"]=formats[6]['resolution'].includes('audio only')?formats[6]['url']:false
              audio_source["title"]=output["title"]
             }
             )



  await res.send(audio_source)
  }
  else if(yturl.includes("/?p=")){
    res.send(yturl)
  }



}




const router = express.Router();

router.get("/", (req, res) => {
  fun(res, req['url'])
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);