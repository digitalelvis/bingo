import React from 'react';
import '../index.css'; // Make sure the classes are applied

const BingoBall = ({ number, size = 'md', className = '', style = {} }) => {
  // size can be 'sm', 'md', 'giant'
  return (
    <div className={`bingo-ball ball-${size} ${className}`} style={style}>
      <span className="ball-number">
        {number}
      </span>
      <div className="ball-underline"></div>
    </div>
  );
};

export default BingoBall;
