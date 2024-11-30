import "../../styles/pathogenesis.css";

import PathogenesisImg from "../../assets/pathogenesis/Pathogenesis.png";


const Pathogenesis = () => {
  return (
    <>
      <div className="pathogenesis-container">
        <div className="pathogenesis-heading">
          <h1>WHAT IS HAPPENING INSIDE THE SKIN?</h1>
        </div>
        <div className="pathogenesis-content">
          <div className="pathogenesis-img">
            <img src={PathogenesisImg} alt="" />
          </div>
          <div className="pathogenesis-subheading">
            <p>Pathogenesis of Psoriasis: From normal to inflamed skin</p>
          </div>
          <div className="pathogenesis-acronyms">
            <p>
              AMP - Adenosine Monophosphate; APC-Antigen Presenting Cells; CCL-
              Chemokine Ligands; CXC - Chemokines; DAMP - Danger-Associated
              Molecular Pattern; IFN-Υ - Interferon-gamma; IL - Interleukin;
              LCE3 - Late Cornified Envelope; NOD - Nucleotide-binding
              Oligomerization Domain-like receptors; PAMP - Pathogen-Associated
              Molecular Pattern; TCR - T-Cell Receptor; TH - T-helper cells; TLR
              - Toll-Like Receptors; TNF-α - Tumor Necrosis Factor Alpha
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pathogenesis;
