import "../../styles/pasi.css";

import Folks from "../../assets/pasi/Folks.png";

const Pasi = () => {
  return (
    <>
      <div className="pasi-container">
        <div className="pasi-container-content">
          {/* left section */}
          <div className="pasi-left-content">
            <div className="pasi-heading">
              <h1>
                What is <span>PASI</span>?
              </h1>
            </div>
            <div className="pasi-list">
              <li>
                It is a scoring system to measure the severity of psoriatic
                lesions.
              </li>
              <li>
                PASI scores range from 0 (no disease) to 72 (maximal disease).
              </li>
              <li>
                PASI 50 or 75 (improvement of 50% or 75% from baseline score,
                respectively) is a standard measure of response to treatment.
              </li>
              <li>
                PASI 90-100 indicates a significant improvement from baseline
                PASI score.
              </li>
            </div>
          </div>
          {/* right section */}
          <div className="pasi-right-content">
            <img src={Folks} alt="Folks" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Pasi;
