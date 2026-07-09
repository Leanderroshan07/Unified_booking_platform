import React from 'react';
import styled from 'styled-components';

const StyledSubmitButton = ({ onClick, disabled, title, icon: Icon }) => {
  return (
    <StyledWrapper>
      <button 
        className="btn-class-name" 
        onClick={onClick} 
        disabled={disabled}
        title={title}
      >
        <span className="back" />
        <span className="front" />
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .btn-class-name {
    --primary: 30, 30, 30;
    --secondary: 10, 10, 10;
    width: 60px;
    height: 50px;
    border: none;
    outline: none;
    cursor: pointer;
    user-select: none;
    touch-action: manipulation;
    outline: 10px solid rgb(var(--primary), .5);
    border-radius: 100%;
    position: relative;
    transition: .3s;
    box-shadow: 0 4px 15px rgba(30, 30, 30, 0.5);
    
    &:hover:not(:disabled) {
      --primary: 80, 80, 80;
      --secondary: 40, 40, 40;
      box-shadow: 0 6px 25px rgba(80, 80, 80, 0.5);
      transform: scale(1.05);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:active:not(:disabled) .front {
      transform: translateY(0%);
      box-shadow: 0 0;
    }
  }

  .btn-class-name .back {
    background: rgb(var(--secondary));
    border-radius: 100%;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  .btn-class-name .front {
    background: linear-gradient(0deg, rgba(var(--primary), .6) 20%, rgba(var(--primary)) 50%);
    box-shadow: 0 .5em 1em -0.2em rgba(var(--secondary), .5);
    border-radius: 100%;
    position: absolute;
    border: 1px solid rgb(var(--secondary));
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    font-weight: 600;
    font-family: inherit;
    transform: translateY(-15%);
    transition: .15s;
    color: rgb(var(--secondary));
    z-index: 2;
  }

  .btn-class-name:hover:not(:disabled) .front {
    transform: translateY(-20%);
  }
`;

export default StyledSubmitButton;
