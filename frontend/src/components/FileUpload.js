import React, { Component } from 'react';
import classnames from 'classnames'

import ErrorAlert from './ErrorAlert';

class FileUpload extends Component {
	constructor(props) {
 //       console.log("app");
        super(props);

        this.boxClasses = ['box'];

        const isAdvancedUpload = function() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        }();

		if (isAdvancedUpload) {
    		this.boxClasses.push('has-advanced-upload');
    	}
    }

    render() {
        return (
        	<div>
				<div className="row">
	                <form className={classnames(this.boxClasses)} method="post" action="" encType="multipart/form-data">
	  					<div className="box__input">
							<input className="box__file" accept="audio" type="file" name="files[]" id="file" onChange={e => this.props.handleFileChange(e)} data-multiple-caption="{count} files selected" multiple />
							<label htmlFor="file"><strong>Choose a file</strong><span className="box__dragndrop"> or drag it here</span>.</label>
							<button className="box__button" type="submit">Upload</button>
					  </div>
					  <div className="box__uploading">Uploading&hellip;</div>
					  <div className="box__success">Done!</div>
					  <div className="box__error">Error! <span></span>.</div>
					</form>
	            </div>
                <ErrorAlert error={this.props.error} />
            </div>
    	);
	}
}

export default FileUpload;