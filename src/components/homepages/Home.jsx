import MeditatingIcon from "../../assets/homepage/meditating.png";

import { Link } from "react-router-dom";

const Home = () => {
  const scrollToPsoriaBuddy = () => {
    const psoriaBuddySection = document.getElementById("psoriabuddy");
    if (psoriaBuddySection) {
      psoriaBuddySection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <main className="home-content">
      <div className="hero">
        <div className="hero-image">
          <img src={MeditatingIcon} alt="Meditation" />
        </div>
        <h1>PsoriaBuddy</h1>
        <p>Your Digital Path to Psoriasis Relief!</p>
        <div className="learn-more-link">
          <Link onClick={scrollToPsoriaBuddy} className="learn-more-btn">
            Learn More
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Home;
