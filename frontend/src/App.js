import React from 'react';
import { NavLink, Route, BrowserRouter } from "react-router-dom";
import io from 'socket.io-client';

import EventEmitter from 'events';

import TrackControls from './components/TrackControls';
import AudioPlayer from './components/AudioPlayer';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import Footer from './components/Footer';

const base64Arraybuffer = require("base64-arraybuffer");

function Song (id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data;
}


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            action: 'stop',
            duration: undefined,
            error: undefined,
            filename: undefined,
            pitch: 1,
            simpleFilter: undefined,
            t: 0,
            tempo: 1,
            songs: [],
            selected: null
        };

        this.emitter = new EventEmitter();
        this.emitter.on('state', state => this.setState(state));
        this.emitter.on('stop', () => this.stop());

        this.audioPlayer = new AudioPlayer({
            emitter: this.emitter,
            pitch: this.state.pitch,
            tempo: this.state.tempo,
        });

        this.init = false;
    }

    data2ab = async (data) => {
        let arrayBuffer = base64Arraybuffer.decode(data);
        let buffer = await this.audioPlayer.decodeAudioData(arrayBuffer);
        return buffer;
    }

    componentDidMount(){
        this.socket = io.connect("http://localhost:3001");

        this.getDataFromDb(this.socket);
    }

    fillSongList = (data) => {
        console.log(data);
        if (data.length) {
            this.setState((state) => {
                let songs = state.songs.slice(0, state.songs.length - data.length);
                for (var i = 0; i < data.length; i++) {
                    //console.log(data[i].content);
                    songs.push(new Song(i, data[i].name, data[i].content));
                }
                return {songs: songs};
            });
        }
    }

    getDataFromDb = socket => {
        socket.emit("loadAll");
        socket.on("loadAllNames", this.fillSongList);
        socket.on("loadAll", this.fillSongList);
    }

    play() {
        if (this.state.action !== 'play') {
            this.audioPlayer.play();
            this.setState({action: 'play'});
        }
    }

    pause() {
        if (this.state.action === 'play') {
            this.audioPlayer.pause();
            this.setState({action: 'pause'});
        }
    }

    stop() {
        this.pause();
        this.audioPlayer.seekPercent(0);
        this.setState({action: 'stop', t: 0});
    }

    handleFileChange(e) {
        for (var i = 0; i < e.target.files.length; i++) {
            this.emitter.emit('state', {
                error: undefined,
                filename: undefined,
            });
            const file = e.target.files[i];
            const filename = file.name;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async event => {
                let data = reader.result.slice(reader.result.search(";")+8)

                try {
                    // Test if the file can be decoded as audio.
                    await this.data2ab(data);
                } catch (err) {
                    this.emitter.emit('state', {
                        error: {
                            message: err.message,
                            type: 'Decoding error',
                        },
                    });
                    return;
                }

                let songs = this.state.songs;
                songs.unshift(new Song(songs.length, filename, data));
                this.setState((state) => {
                    return {songs: songs,
                            error: {
                                message: "Uploaded " + filename + " !",
                                type: ''
                            },
                    }
                });

                this.socket.emit("upload", { name: filename, content: data });
            }
        }
    }

    handleSongChange(e) {
        e.persist();
        if (this.state.action === "stop" || this.state.selected != e.target.id) {
            console.log("change song");
            this.stop();

            var retriveAudioBuffer = new Promise((res, rej) => {
                res(this.data2ab(this.state.songs[e.target.id].data));
            })

            retriveAudioBuffer.then((buffer) => {
                this.audioPlayer.setBuffer(
                    buffer, 
                    this.audioPlayer.play.bind(this.audioPlayer)
                )
                this.setState((state) => {
                    return {
                        action: 'play',
                        selected: e.target.id,
                        filename: this.state.songs[e.target.id].name
                    }
                });
                console.log("finish");
            }, (err) => { 
                console.log(err.message) 
            });
        }
    }

    handlePitchChange(e) {
        const pitch = e.target.value;
        this.audioPlayer.pitch = pitch;
        this.setState({pitch});
    }

    handleTempoChange(e) {
        const tempo = e.target.value;
        this.audioPlayer.tempo = tempo;
        this.setState({tempo});
    }

    handleSeek(e) {
        const percent = parseFloat(e.target.value);
        this.audioPlayer.seekPercent(percent);
    }

    percentDone() {
        if (!this.state.duration) {
            return 0;
        }

        return this.state.t / this.state.duration * 100;
    }

    render() {
        return (
            <div className="container" style={{marginTop: '1em'}}>
                <BrowserRouter>
                <Header>
                    <NavLink to="/" className="nav-link">Upload</NavLink>
                    <NavLink to="/music" className="nav-link">Music</NavLink>
                </Header>
                <div>
                    <Route exact path="/" render={() => 
                        <FileUpload 
                            error={this.state.error} 
                            handleFileChange={(e) => this.handleFileChange(e)}
                        />
                    } />
                    <Route exact path="/music" render={() => 
                        <span>
                            <div className="left-column">
                                <h3> Tracklist </h3>
                                {
                                    this.state.songs.map((song, idx) => 
                                        <button 
                                            className="brk-btn btn" 
                                            key={idx} 
                                            id={idx} 
                                            disabled={ song.data === undefined }
                                            onClick={(event) => this.handleSongChange(event)}>{ song.name }
                                        </button>
                                    )
                                }
                            </div>

                            <div className="right-column">
                                <h3> Controls </h3>
                                <div className="row">
                                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '6px'}}>
                                        <TrackControls
                                            action={this.state.action}
                                            filename={this.state.filename}
                                            onPlay={() => this.play()}
                                            onPause={() => this.pause()}
                                            onStop={() => this.stop()}
                                        />
                                    </div>
                                    <div className="col-xs-7 col-sm-9 col-lg-10">
                                        <input
                                            className="form-control slider"
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="0.05"
                                            value={this.percentDone()}
                                            onChange={e => this.handleSeek(e)}
                                        />
                                    </div>
                                </div>


                                <div className="row">
                                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '7px'}}>
                                        <span style={{float: "left"}}>Pitch ({this.state.pitch}x)</span>
                                    </div>
                                    <div className="col-xs-7 col-sm-9 col-lg-10">
                                        <input
                                            className="form-control slider"
                                            type="range"
                                            min="0.05"
                                            max="2"
                                            step="0.05"
                                            defaultValue={this.state.pitch}
                                            onChange={e => this.handlePitchChange(e)}
                                        />
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '7px'}}>
                                        Tempo ({this.state.tempo}x)
                                    </div>
                                    <div className="col-xs-7 col-sm-9 col-lg-10">
                                        <input
                                            className="form-control slider"
                                            type="range"
                                            min="0.05"
                                            max="2"
                                            step="0.05"
                                            defaultValue={this.state.tempo}
                                            onChange={e => this.handleTempoChange(e)}
                                        />
                                    </div>
                                </div>
                            </div>
                            </span>
                        } />
                </div>
                <Footer />
                </BrowserRouter>
            </div>
        );
    }
}

export default App;
