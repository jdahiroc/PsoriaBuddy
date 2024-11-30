import "../../styles/psoriabuddy.css";

import laptop1 from "../../assets/homepage/laptop1.png";
import laptop2 from "../../assets/homepage/laptop2.png";

const PsoriaBuddy = () => {
  return (
    <>
      <div className="psoriabuddy-container">
        <div className="psoriabuddy-content">
          <div className="psoriabuddy-text-content">
            <div className="psoriabuddy-text">
              <h1>PsoriaBuddy</h1>
              <p>
                We offer a personalized, easy-to-use platform to help you assess
                your symptoms and manage your psoriasis.
              </p>
            </div>
            <div className="psoriabuddy-explorenow-button">
              <button>Explore Now</button>
            </div>
          </div>

          <div className="psoriabuddy-images">
            <div className="psoriabuddy-image1">
              <img src={laptop2} alt="Laptop1" />
            </div>
            <div className="psoriabuddy-image2">
              <img src={laptop1} alt="Laptop2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PsoriaBuddy;
