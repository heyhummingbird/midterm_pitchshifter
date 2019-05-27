import React from 'react';
import PropTypes from 'prop-types';

const TrackControls = props => {
    //console.log(props.filename);
    const disabled = (props.filename === undefined);

    let playOrPause;
    if (props.action === 'play') {
        playOrPause = (
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onPause}
            >
                Pause
            </button>
        );
    } else {
        playOrPause = (
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onPlay}
            >
                Play
            </button>
        );
    }

    return (
        <span>
            {playOrPause}
            <button
                className="btn btn-secondary btn-sm"
                disabled={disabled}
                onClick={props.onStop}
                style={{marginLeft: '0.25em'}}
            >
                Stop
            </button>
        </span>
    );
};

TrackControls.propTypes = {
    action: PropTypes.string,
    filename: PropTypes.string,
    onPause: PropTypes.func,
    onPlay: PropTypes.func,
    onStop: PropTypes.func,
};

export default TrackControls;
