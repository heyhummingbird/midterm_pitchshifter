import React, { Component } from 'react';

import favicon from '../img/hummingbird.ico';

class FooterDOM extends Component {
    render() {
        return (
            <div>
                <footer className="footer-area section-gap" style={{marginTop: "20em"}}>
                    <div className="container col-lg-12">
                        <div className="footer-bottom footer_copy">
                            <div className="single-footer-widget footer_middle">
                                <img src={favicon} width="60px" alt=""></img>
                            </div>
                            <div className="footer-social">
                                <a href="https://www.facebook.com/profile.php?id=100000599301324">
                                    <i className="fa fa-facebook"></i>
                                </a>
                                <a href="https://github.com/heyhummingbird">
                                    <i className="fa fa-github"></i>
                                </a>
                                <a href="https://www.instagram.com/hummingbird144/?hl=en">
                                    <i className="fa fa-instagram"></i>
                                </a>
                            </div>

                            <p>
                                Copyright © {new Date().getFullYear()} All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        );
    }
}

export default FooterDOM;