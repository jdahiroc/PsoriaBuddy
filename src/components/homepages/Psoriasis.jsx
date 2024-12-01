//  Styles
import "../../styles/psoriasis.css";
//  Assets
import WomanPsoriasis from "../../assets/homepage/woman-psoriasis.png";
//  React Hooks
import React, { useState } from "react";

const Psoriasis = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = () => {
    setIsLoading(true);
    // Short delay to show the loader
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };

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
                <a
                  href="https://psoria-buddy.vercel.app/files/Psoriasis-Guide.pdf"
                  download="Psoriasis-Guide.pdf"
                  onClick={handleDownload}
                >
                  <button disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="spinner"></span> Preparing...
                      </>
                    ) : (
                      "Download PDF"
                    )}
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Psoriasis;
