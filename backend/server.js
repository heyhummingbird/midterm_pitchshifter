require('dotenv').config()

const Song = require("./model/song");
const mongoose = require("mongoose");

const express = require("express");
const cors = require('cors');
const bodyParser = require("body-parser");
const logger = require("morgan");

const API_PORT = 3001;

const router = express.Router();

var http = require('http');
var app = express();
var server = app.listen(API_PORT);
var serverSocket = require('socket.io').listen(server);

app.use(cors());

// this is our MongoDB database
const dbRoute = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;

// connects our back end code with the database

mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => {
    console.log('MongoDB connected!')
    serverSocket.on('connection', socket => {
        const sendStatus = s => {
            socket.emit('status', s)
        }

        socket.on('upload', data => {
            // Insert message
            const song = new Song({ 
                name: data.name, 
                content: data.content 
            })

            song.save(err => {
                if (err) console.error(err)
                console.log("[*] Uploaded " + data.name);

                // Saved!
                sendStatus({
                    message: 'Song uploaded',
                    clear: true
                })
            })
        })

        socket.on('loadAll', async () => {
            await Song.find({}, { name: 1 })
                .sort({ _id: -1 })
                .exec((err, res) => {
                    if (err) throw err;
                    socket.emit('loadAllNames', res);
                }
            );

            Song.find()
              .sort({ _id: -1 })
              .exec((err, res) => {
                  if (err) throw err;
                  socket.emit('loadAll', res);
              }
            )
        })

        socket.on('clear', () => {
            // Remove all chats from collection
            Song.deleteMany({}, () => {
                // Emit cleared
                socket.broadcast.emit('cleared')
            })
        })


    })
});

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));



// launch our backend into a port
//app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
