const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { nextTick } = require('process');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'img/');
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const imageFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

//ทำให้สมบูรณ์
app.post('/profilepic', async (req,res) => {
    let upload = await multer({ storage: storage, fileFilter: imageFilter }).single('avatar');
    let user = req.cookies.username

    upload(req, res, (err) => {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        let filename = req.file.filename
        updateImg(user, filename).then(()=>{
            console.log(filename)
            res.cookie('img', filename)
            console.log('Change Complete')
            return res.redirect('feed.html')
        })
    })
})

//ทำให้สมบูรณ์
app.get('/logout', (req,res) => {
    res.clearCookie('username')
    res.clearCookie('img')
    console.log("Log out")
    return res.redirect('index.html');
})

//ทำให้สมบูรณ์
app.get('/readPost', async (req,res) => {
    let post_r = await readJson('./js/postDB.json')
    res.send(post_r)
})

app.get('/example/b', function (req, res, next) {
    console.log('the response will be sent by the next function ...')
    next()
  }, function (req, res) {
    res.send('Hello from B!')
  })


//ทำให้สมบูรณ์
app.post('/writePost',async (req,res) => {
    let post = await readJson('./js/postDB.json') 
    let postData = JSON.parse(post)
    let keys = Object.keys(postData)
    for(var i = 0; i <= keys.length; i++){
        if(i == keys.length){
            let mykeys= "post"+(i+1)
            let getPost = req.body
            postData[mykeys] = getPost
            console.log(postData)
        }
    }

    let postNewDB = JSON.stringify(postData)
    writeJson(postNewDB, './js/postDB.json')
    res.send(postData)
})

//ทำให้สมบูรณ์
app.post('/checkLogin',async (req,res) => {
    //เก็บ username,password ในตัวแปร
    let user_f = await req.body.username
    let pass_f = await req.body.password

    let check = await readJson('./js/userDB.json')
    let checkdata = JSON.parse(check)

    console.log(user_f)
    console.log(pass_f)
  
    let keys = Object.keys(checkdata)
    for(var i = 0; i <= keys.length; i++)
    {
        let index = "user"+(i+1)
        let usercheck = checkdata[index]["username"]
        let passcheck = checkdata[index]["password"]
        let imgcheck = checkdata[index]["img"]
        console.log(usercheck)
        if(user_f == usercheck && pass_f == passcheck){
            console.log("Now, You are Log in")
            res.cookie('username', user_f)
            res.cookie('img', imgcheck)
            return res.redirect('feed.html');
        }
        else if(i == 4){
            console.log("False")
            return res.redirect('index.html?error=1')
        }
    }
})

//ทำให้สมบูรณ์
const readJson = (filename) => {
    return new Promise((resolve,reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) 
                reject(err);
            else
            {
                resolve(data);
            }
        });
    })
}

//ทำให้สมบูรณ์
const writeJson = (data,file_name) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(file_name, data , (err) => {
            if (err) 
                reject(err);
            else
            {
                var x = JSON.parse(data)
            }

            resolve(JSON.stringify(x,null,'\n'))
        });
    })
}

//ทำให้สมบูรณ์
const updateImg = async (username, fileimg) => {
    return new Promise((resolve,reject) => { 
        fs.readFile('./js/userDB.json', (err, data) => {
            if (err) 
                reject(err);
            else
            {
                var userData = JSON.parse(data)
                let keys = Object.keys(userData)
                for(var i = 0; i <= keys.length; i++){
                    let index = "user"+(i+1)
                    let usercheck = userData[index]["username"]
                    if(username == usercheck){
                        userData[index]["img"] = fileimg
                        break
                    }
                } 
            } 

            let userNewDB = JSON.stringify(userData)
            writeJson(userNewDB, './js/userDB.json')
            resolve(data);
        });
    });
}

app.listen(port, hostname, () => {
        console.log(`Server running at   http://${hostname}:${port}/`);
});
