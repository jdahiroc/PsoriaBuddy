import "../../styles/managementsystematic.css";

import systematic1 from "../../assets/management/systematic1.png";
import systematic2 from "../../assets/management/systematic2.png";
import systematic3 from "../../assets/management/systematic3.png";
import systematic4 from "../../assets/management/systematic4.png";
import systematic5 from "../../assets/management/systematic5.png";

const ManagementSystematic = () => {
  return (
    <>
      <div className="systematic-container">
        <div className="systematic-contents">
          {/* heading */}
          <div className="systematic-heading">
            <h2>
              <span>Management:</span> Systematic Treatments
            </h2>
          </div>
          {/* content */}
          <div className="systematic-tiles">
            <div className="systematic1">
              <img src={systematic1} alt="systematic1" />
              <p>Methotrexate</p>
            </div>
            <div className="systematic2">
              <img src={systematic2} alt="systematic2" />
              <p>Cyclosporin A (CyA)</p>
            </div>
            <div className="systematic3">
              <img src={systematic3} alt="systematic3" />
              <p>Acitretin</p>
            </div>
            <div className="systematic4">
              <img src={systematic4} alt="systematic4" />
              <p>UVB Phototherapy</p>
            </div>
            <div className="systematic5">
              <img src={systematic5} alt="systematic5" />
              <p>Psoralen plus Ultraviolet A (PUVA)</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagementSystematic;
