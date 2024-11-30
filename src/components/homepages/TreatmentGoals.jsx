import "../../styles/treatmentgoals.css";

import First from "../../assets/treatmentgoals/First.png";
import Second from "../../assets/treatmentgoals/Second.png";
import Third from "../../assets/treatmentgoals/Third.png";

const TreatmentGoals = () => {
  return (
    <>
      <div className="treatmentgoals-container">
        {/* Left Section */}
        <div className="treatmentgoals-left-section">
          <div className="treatmentgoals-left-content">
            <div className="treatmentgoals-heading">
              <h1>
                Your treatment <span>goals</span>
              </h1>
            </div>
            <div className="treatmentgoals-list">
              <li>Promote skin healing and quick skin improvement.</li>
              <li>Boost confidence in therapy.</li>
              <li>Develop control over the disease.</li>
              <li>Provide clear diagnosis and therapy.</li>
              <li>Prevent fear of worsening of the disease.</li>
              <li>Improve quality of life.</li>
            </div>
          </div>
          {/* Right Section */}
          <div className="treatmentgoals-right-content">
            <div className="treatmentgoals-img">
              <img src={First} alt="First" />
              <img src={Second} alt="Second" />
              <img src={Third} alt="Third" />
            </div>
            <div className="treatmentgoals-subtext">
              <p>
                *Clinically meaningful improvements in the treatment of
                psoriasis.*
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TreatmentGoals;
