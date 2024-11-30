import "../../styles/lifestylemodification.css";

import lifestyle1 from "../../assets/pasi/lifestyle1.png";
import lifestyle2 from "../../assets/pasi/lifestyle2.png";
import lifestyle3 from "../../assets/pasi/lifestyle3.png";
import lifestyle4 from "../../assets/pasi/lifestyle4.png";
import lifestyle5 from "../../assets/pasi/lifestyle5.png";
import lifestyle6 from "../../assets/pasi/lifestyle6.png";
import lifestyle7 from "../../assets/pasi/lifestyle7.png";

const LifeStyleModifications = () => {
  return (
    <>
      <div className="modification-container">
        <div className="modification-contents">
          {/* heading */}
          <div className="modification-heading">
            <h2>
              <span>Lifestyle Modifications:</span> What can you do?
            </h2>
          </div>
          {/* content */}
          <div className="modification-tiles">
            <div className="lifestyle1">
              <img src={lifestyle1} alt="lifestyle1" />
              <p>Eat a healthy diet</p>
            </div>
            <div className="lifestyle2">
              <img src={lifestyle2} alt="lifestyle2" />
              <p>Exercise regularly</p>
            </div>
            <div className="lifestyle3">
              <img src={lifestyle3} alt="lifestyle3" />
              <p>Manage your stress</p>
            </div>
            <div className="lifestyle4">
              <img src={lifestyle4} alt="lifestyle4" />
              <p>Control you chronic conditions</p>
            </div>
            <div className="lifestyle5">
              <img src={lifestyle5} alt="lifestyle5" />
              <p>Adhere to your medification regimen</p>
            </div>
            <div className="lifestyle6">
              <img src={lifestyle6} alt="lifestyle6" />
              <p>Avoid Triggers</p>
            </div>
            <div className="lifestyle7">
              <img src={lifestyle7} alt="lifestyle7" />
              <p>Find a support group</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LifeStyleModifications;
