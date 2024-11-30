import "../../styles/management.css";

import management1 from "../../assets/management/management1.png";
import management2 from "../../assets/management/management2.png";
import management3 from "../../assets/management/management3.png";
import management4 from "../../assets/management/management4.png";
import management5 from "../../assets/management/management5.png";
import management6 from "../../assets/management/management6.png";
import management7 from "../../assets/management/management7.png";
import management8 from "../../assets/management/management8.png";

const Management = () => {
  return (
    <>
      <div className="management-container">
        <div className="management-contents">
          {/* heading */}
          <div className="management-heading">
            <h2>
              <span>Management:</span> Creams, Lotions, Ointments
            </h2>
          </div>
          {/* content */}
          <div className="management-tiles">
            <div className="management1">
              <img src={management1} alt="management1" />
              <p>Topical corticosteriods</p>
            </div>
            <div className="management2">
              <img src={management2} alt="management2" />
              <p>Vitamin D analogues</p>
            </div>
            <div className="management3">
              <img src={management3} alt="management3" />
              <p>Anthralin</p>
            </div>
            <div className="management4">
              <img src={management4} alt="management4" />
              <p>Topical retinoids</p>
            </div>
            <div className="management5">
              <img src={management5} alt="management5" />
              <p>Calcineurin inhibitors</p>
            </div>
            <div className="management6">
              <img src={management6} alt="management6" />
              <p>Salicylic Acid</p>
            </div>
            <div className="management7">
              <img src={management7} alt="management7" />
              <p>Coal tar</p>
            </div>
            <div className="management8">
              <img src={management8} alt="management8" />
              <p>Moisturizers</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Management;
