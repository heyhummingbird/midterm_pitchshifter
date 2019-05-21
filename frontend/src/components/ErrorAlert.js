import React from 'react';
import PropTypes from 'prop-types';

const ErrorAlert = props => {
    if (props.error === undefined) {
        return null;
    }

    if (props.error.type === '') {
        return (
            <div className="alert alert-success" style={{marginTop: '2em'}}>
                {props.error.message}
            </div>
        );
    }

    return (
        <div className="alert alert-danger" style={{marginTop: '2em'}}>
            <b>{props.error.type}:</b> {props.error.message}
        </div>
    );
};

ErrorAlert.propTypes = {
    error: PropTypes.shape({
        type: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
    }),
};

export default ErrorAlert;
