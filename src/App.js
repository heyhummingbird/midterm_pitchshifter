import React, { Component } from 'react';
import { NavLink, Switch, Route, Redirect, BrowserRouter } from "react-router-dom";
//import io from 'socket.io-client';

import EventEmitter from 'events';

import TrackControls from './components/TrackControls';
import AudioPlayer from './components/AudioPlayer';
import FileUpload from './components/FileUpload';
import Header from './components/Header';
import Footer from './components/Footer';

function Song (id, name, audiobuffer) {
    this.id = id;
    this.name = name;
    this.audiobuffer = audiobuffer;
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
            status: [],
            t: 0,
            tempo: 1,
            upload: false,
            songs: [],
            selected: null
        };

        this.emitter = new EventEmitter();
        this.emitter.on('state', state => this.setState(state));
        this.emitter.on('status', status => {
            if (status === 'Done!') {
                this.setState({status: []});
            } else {
                this.setState({status: this.state.status.concat(status)});
            }
        });
        this.emitter.on('stop', () => this.stop());

        this.audioPlayer = new AudioPlayer({
            emitter: this.emitter,
            pitch: this.state.pitch,
            tempo: this.state.tempo,
        });
    }
/*
    componentDidMount(){
        this.socket = io.connect("http://localhost:3001");
        console.log(this.socket);
        this.socket.on("init", data => {
            if (data.length) {
                for (var i = 0; i < data.length; i++)
                    this.state.songs.push(new Song(i, data.name, this.audioPlayer.decodeAudioData(data.content)));
                this.setState({songs: data});
            }
        });

        this.socket.on("output", data => {
            this.setState({ songs: data});
        })
    }
*/
    play() {
        console.log(this.state.action);
        if (this.state.action !== 'play') {
            //this.audioPlayer.setBuffer(buffer).then(this.audioPlayer.play.bind(this));
                //this.play();
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
        //console.log("file");
        if (e.target.files.length > 0) {
            //this.stop();

            //this.setState({action: 'play'});

            this.emitter.emit('status', 'Reading file...');
            this.emitter.emit('state', {
                error: undefined,
                filename: undefined,
            });

            // http://stackoverflow.com/q/4851595/786644
            const filename = e.target.value.replace('C:\\fakepath\\', '');
            this.emitter.emit('state', {filename});

            const file = e.target.files[0];

            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = async event => {
                this.emitter.emit('status', 'Playing file...');

                let buffer;
                try {
                    buffer = await this.audioPlayer.decodeAudioData(event.target.result);
                    console.log(event.target.result);

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
                songs.push(new Song(songs.length, filename, buffer));
                this.setState((state) => {
                    return {songs: songs,
                            error: {
                                message: "Uploaded " + filename + " !",
                                type: ''
                            }
                    }
                });
                console.log(this.state.songs);



                //this.audioPlayer.setBuffer(buffer, this.audioPlayer.play.bind(this.audioPlayer));
                //this.setState((state) => {
                //    return {selected: this.state.songs.length-1};
                //});
            };

        }
    }

    selectSong(e) {
        e.persist();
        console.log(this.state.selected);
        console.log(e.target.id);
        if (this.state.selected != e.target.id) {
            console.log("change song");
            let buffer = this.state.songs[e.target.id].audiobuffer;
            this.stop();
            this.setState((state) => {
                return {action: 'play',
                        selected: e.target.id}
                }
            );
            this.audioPlayer.setBuffer(buffer, 
                this.audioPlayer.play.bind(this.audioPlayer)
            )
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
        this.play();
    }

    percentDone() {
        if (!this.state.duration) {
            return 0;
        }

        return this.state.t / this.state.duration * 100;
    }
/*
    toArrayBuffer = buf => {
        var ab = new ArrayBuffer(buf.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    toBuffer = ab => {
        console.log(ab);
        console.log(ab.byteLength);
        var buf = Buffer.alloc(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
*/

    render() {
        if (this.state.upload) {
            return <Redirect to="/music" />
        }

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
                                        <button className="brk-btn" key={idx} id={idx} onClick={(event) => this.selectSong(event)}>{ song.name }</button>
                                    )
                                }
                            </div>

                            <div className="right-column">
                                <h3> Controls </h3>
                                <div className="row">
                                    <div className="col-xs-5 col-sm-3 col-lg-2" style={{paddingTop: '6px'}}>
                                        <TrackControls
                                            action={this.state.action}
                                            error={this.state.error}
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
