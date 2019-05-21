import React from 'react';

const NavButtonDOM = (props) => {
	const { children } = props;
    return (
        <li className="nav-item">
            <h5>{children}</h5>
        </li>
    );
}

export default NavButtonDOM;