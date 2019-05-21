import React, { Component } from 'react';
import logo from '../img/logo.png';
import favicon from '../img/hummingbird.ico';

import NavButtonDOM from './NavButton';


class HeaderDOM extends Component {
    constructor(props) {
        super(props);
        this.search_bar = "none";
    }
    render() {
        return (
            <header className="header_area navbar_fixed">
                <div className="main_menu">
                    <nav className="navbar navbar-expand-lg navbar-light">
                        <div className="container">
                            <a href="">
                                <img src={favicon} width="35px" alt=""></img>
                            </a>
                            <div className="collapse navbar-collapse offset" id="navbarSupportedContent">
                                <ul className="nav navbar-nav menu_nav justify-content-center mx-auto">
                                    {this.props.children.map((menu, idx) =>
                                        <NavButtonDOM key={idx}>
                                            {menu}
                                        </NavButtonDOM>
                                    )}
                                </ul>
                                <ul className="nav navbar-nav ml-auto search">
                                    <li className="nav-item d-flex align-items-center mr-10">
                                        <div className="menu-form" style={{display: this.search_bar}}>
                                            <form>
                                                <div className="form-group">
                                                    <input type="text" className="form-control" placeholder="Search here"></input>
                                                </div>
                                            </form>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                </div>
            </header>
        );
    }
}

export default HeaderDOM;
