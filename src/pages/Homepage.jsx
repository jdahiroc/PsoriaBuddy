import "../styles/homepage.css";

import Home from "../components/homepages/Home";
import Navbar from "../components/homepages/Navbar";
import PsoriaBuddy from "../components/homepages/PsoriaBuddy";
import Psoriasis from "../components/homepages/Psoriasis";
import TypesOfPsoriasis from "../components/homepages/TypesOfPsoriasis";
import Pathogenesis from "../components/homepages/Pathogenesis";
import TreatmentGoals from "../components/homepages/TreatmentGoals";
import Pasi from "../components/homepages/Pasi";
import LifeStyleModifications from "../components/homepages/LifeStyleModifications";
import Management from "../components/homepages/Management";
import ManagementSystematic from "../components/homepages/ManagementSystematic";
import FAQs from "../components/homepages/FAQs";
import Footer from "../components/homepages/Footer";

const Homepage = () => {
  return (
    <>
      {/* 1st Section */}

      <Navbar />
      <Home />

      {/* 2nd Section */}
      <PsoriaBuddy />

      {/* 3rd Section */}
      <Psoriasis />

      {/* 4th Section */}
      <TypesOfPsoriasis />

      {/* 5th Section */}
      <Pathogenesis />

      {/* 6th Section */}
      <TreatmentGoals />

      {/* 7th Section */}
      <Pasi />

      {/* 8th Section */}
      <LifeStyleModifications />

      {/* 9th Section */}
      <Management />

      {/* 10th Section */}
      <ManagementSystematic />

      {/* 11th Section */}
      <FAQs />

      {/* 12th section */}
      <Footer />
    </>
  );
};

export default Homepage;
