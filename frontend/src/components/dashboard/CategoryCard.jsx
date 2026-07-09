import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const CategoryCard = ({ title, image, icon: Icon, compact = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  if (compact) {
    return (
      <StyledCompactWrapper>
        <motion.div
          ref={cardRef}
          className="card-compact"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Glow Effect */}
          {isHovered && (
            <div
              className="glow-effect-compact"
              style={{
                top: `${mousePosition.y}px`,
                left: `${mousePosition.x}px`,
              }}
            />
          )}

          <div className="content-compact">
            {/* Back - Shows on hover */}
            <motion.div
              className="back-compact"
              initial={{ opacity: 0, rotateY: -180 }}
              animate={{ opacity: isHovered ? 1 : 0, rotateY: isHovered ? 0 : -180 }}
              transition={{ duration: 0.3 }}
              style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
            >
              <img src={image} alt={title} className="card-image-compact" />
              <div className="overlay-compact">
                <p className="overlay-text-compact">{title}</p>
              </div>
            </motion.div>

            {/* Front - Default view */}
            <motion.div
              className="front-compact"
              initial={{ opacity: 1, rotateY: 0 }}
              animate={{ opacity: isHovered ? 0 : 1, rotateY: isHovered ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="icon-wrapper-compact">
                {Icon && <Icon size={24} />}
              </div>
              <h3 className="title-compact">{title}</h3>
            </motion.div>
          </div>
        </motion.div>
      </StyledCompactWrapper>
    );
  }

  // Full-size version
  return (
    <StyledWrapper>
      <motion.div
        ref={cardRef}
        className="card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Glow Effect */}
        {isHovered && (
          <div
            className="glow-effect"
            style={{
              top: `${mousePosition.y}px`,
              left: `${mousePosition.x}px`,
            }}
          />
        )}

        <div className="content">
          {/* Back - Shows on hover */}
          <motion.div
            className="back"
            initial={{ opacity: 0, rotateY: -180 }}
            animate={{ opacity: isHovered ? 1 : 0, rotateY: isHovered ? 0 : -180 }}
            transition={{ duration: 0.4 }}
            style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
          >
            <div className="back-content">
              <img src={image} alt={title} className="card-image" />
              <div className="overlay">
                <p className="overlay-text">{title}</p>
              </div>
            </div>
          </motion.div>

          {/* Front - Default view */}
          <motion.div
            className="front"
            initial={{ opacity: 1, rotateY: 0 }}
            animate={{ opacity: isHovered ? 0 : 1, rotateY: isHovered ? 180 : 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="front-content">
              <div className="icon-wrapper">
                {Icon && <Icon size={48} />}
              </div>
              <h3 className="title">{title}</h3>
              <p className="subtitle">Explore</p>
            </div>

            {/* Animated circles */}
            <div className="circles">
              <div className="circle circle-1"></div>
              <div className="circle circle-2"></div>
              <div className="circle circle-3"></div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </StyledWrapper>
  );
};

const StyledCompactWrapper = styled.div`
  .card-compact {
    position: relative;
    width: 160px;
    height: 160px;
    cursor: pointer;
    perspective: 1000px;
  }

  .glow-effect-compact {
    position: fixed;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(0, 210, 255, 0.15) 0%,
      rgba(0, 210, 255, 0.08) 15%,
      rgba(0, 210, 255, 0.04) 25%,
      rgba(0, 210, 255, 0.02) 40%,
      rgba(0, 210, 255, 0.01) 65%,
      transparent 70%
    );
    z-index: 200;
    opacity: 0.8;
    transform: translate(-50%, -50%);
    mix-blend-mode: screen;
  }

  .content-compact {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.4);
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(0, 210, 255, 0.2);
  }

  .front-compact,
  .back-compact {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 16px;
  }

  .front-compact {
    background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 30, 60, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 210, 255, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .icon-wrapper-compact {
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, rgba(0, 210, 255, 0.2), rgba(0, 210, 255, 0.05));
    border-radius: 50%;
    border: 1px solid rgba(0, 210, 255, 0.3);
    color: #00d2ff;
    animation: pulse-icon-compact 2s ease-in-out infinite;
  }

  @keyframes pulse-icon-compact {
    0%,
    100% {
      box-shadow: 0 0 12px rgba(0, 210, 255, 0.3);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 24px rgba(0, 210, 255, 0.5);
      transform: scale(1.05);
    }
  }

  .title-compact {
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    font-family: 'Poppins', sans-serif;
    text-align: center;
  }

  .back-compact {
    background: #000000;
    overflow: hidden;
  }

  .card-image-compact {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .overlay-compact {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: flex-end;
    padding: 12px;
  }

  .overlay-text-compact {
    color: #00d2ff;
    font-size: 13px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  }
`;

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 280px;
    height: 280px;
    cursor: pointer;
    perspective: 1000px;
  }

  .glow-effect {
    position: fixed;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgba(0, 210, 255, 0.15) 0%,
      rgba(0, 210, 255, 0.08) 15%,
      rgba(0, 210, 255, 0.04) 25%,
      rgba(0, 210, 255, 0.02) 40%,
      rgba(0, 210, 255, 0.01) 65%,
      transparent 70%
    );
    z-index: 200;
    opacity: 0.8;
    transform: translate(-50%, -50%);
    mix-blend-mode: screen;
  }

  .content {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(0, 210, 255, 0.2);
  }

  .front,
  .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 20px;
  }

  .front {
    background: linear-gradient(135deg, rgba(10, 14, 39, 0.95) 0%, rgba(20, 30, 60, 0.95) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 210, 255, 0.2);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .front-content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
    text-align: center;
  }

  .icon-wrapper {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle, rgba(0, 210, 255, 0.2), rgba(0, 210, 255, 0.05));
    border-radius: 50%;
    border: 2px solid rgba(0, 210, 255, 0.3);
    color: #00d2ff;
    animation: pulse-icon 2s ease-in-out infinite;
  }

  @keyframes pulse-icon {
    0%,
    100% {
      box-shadow: 0 0 20px rgba(0, 210, 255, 0.3);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 40px rgba(0, 210, 255, 0.5);
      transform: scale(1.05);
    }
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    font-family: 'Poppins', sans-serif;
  }

  .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 2px;
    margin: 0;
  }

  .circles {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .circle {
    position: absolute;
    border-radius: 50%;
    filter: blur(20px);
    opacity: 0.4;
    animation: floating 3s ease-in-out infinite;
  }

  .circle-1 {
    width: 120px;
    height: 120px;
    background: linear-gradient(135deg, #00d2ff, #0099ff);
    top: -40px;
    right: -40px;
    animation-delay: 0s;
  }

  .circle-2 {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #0099ff, #00d2ff);
    bottom: -30px;
    left: -30px;
    animation-delay: -1s;
  }

  .circle-3 {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #00a8d8, #0099ff);
    top: 50%;
    left: -50px;
    animation-delay: -2s;
  }

  @keyframes floating {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(15px);
    }
  }

  .back {
    background: #000000;
    overflow: hidden;
  }

  .back-content {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .card-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0, 210, 255, 0.1), rgba(0, 0, 0, 0.6));
    display: flex;
    align-items: flex-end;
    padding: 20px;
  }

  .overlay-text {
    color: #00d2ff;
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  }
`;

export default CategoryCard;
