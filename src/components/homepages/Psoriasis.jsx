import "../../styles/psoriasis.css";

import WomanPsoriasis from "../../assets/homepage/woman-psoriasis.png";

const Psoriasis = () => {
  return (
    <>
      <div className="psoriasis-container">
        <div className="psoriasis-content">
          <div className="psorisis-image">
            <div className="psoriasis-image1">
              <img src={WomanPsoriasis} alt="Woman with Psoriasis" />
            </div>
            <div className="psoriasis-text-content">
              <div className="psoriasis-text">
                <h1>
                  What is <span>Psoriasis</span>?
                </h1>
                <p>
                  Psoriasis is a chronic, autoimmune disease that appears on the
                  skin. It occurs when the immune system sends out faulty
                  signals that speed up the growth cycle of skin cells.
                  Psoriasis is not contagious.
                </p>
              </div>
              <div className="psoriasis-download-button">
                <button>Download PDF</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Psoriasis;
