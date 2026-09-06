'use client';
import { motion } from "motion/react";

const missions = [
  {
    title: "Anticiper les risques",
    text: "Détecter suffisamment tôt les zones, périodes et équipements susceptibles de subir une coupure électrique.",
    tone: "orange",
  },
  {
    title: "Améliorer la prise de décision",
    text: "Donner aux opérateurs et aux responsables des informations compréhensibles pour organiser leurs actions.",
    tone: "black",
  },
  {
    title: "Informer les utilisateurs",
    text: "Transmettre des alertes ciblées aux personnes réellement concernées par une coupure planifiée ou un risque important.",
    tone: "orange",
  },
];

const IconWarning = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" id="warning-alt" data-name="Flat Line" xmlns="http://www.w3.org/2000/svg" className="icon flat-line">
    <path id="secondary" d="M10.25,4.19,2.63,18a2,2,0,0,0,1.75,3H19.62a2,2,0,0,0,1.75-3L13.75,4.19A2,2,0,0,0,10.25,4.19Z" style={{ fill: "#EE7B04", strokeWidth: 2 }}></path>
    <line id="primary-upstroke" x1="12.05" y1="17" x2="11.95" y2="17" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2.5 }}></line>
    <path id="primary" d="M12,9v4M10.25,4.19,2.63,18a2,2,0,0,0,1.75,3H19.62a2,2,0,0,0,1.75-3L13.75,4.19A2,2,0,0,0,10.25,4.19Z" style={{ fill: "none", stroke: "#000000", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2 }}></path>
  </svg>
);

const IconInfo = () => (
  <svg width="1em" height="1em" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet">
    <path fill="#EE7B04" d="M0 4a4 4 0 0 1 4-4h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4z"></path>
    <path fill="#FFF" d="M20.512 8.071c0 1.395-1.115 2.573-2.511 2.573c-1.333 0-2.511-1.209-2.511-2.573c0-1.271 1.178-2.45 2.511-2.45c1.333.001 2.511 1.148 2.511 2.45zm-4.744 6.728c0-1.488.931-2.481 2.232-2.481c1.302 0 2.232.992 2.232 2.481v11.906c0 1.488-.93 2.48-2.232 2.48s-2.232-.992-2.232-2.48V14.799z"></path>
  </svg>
);

const IconMessage = () => (
  <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M18.5 6C10.4919 6 4 12.4919 4 20.5C4 38.5 28 42 28 42V35H29.5C37.5081 35 44 28.5081 44 20.5C44 12.4919 37.5081 6 29.5 6H18.5ZM24 23.5C25.3807 23.5 26.5 22.3807 26.5 21C26.5 19.6193 25.3807 18.5 24 18.5C22.6193 18.5 21.5 19.6193 21.5 21C21.5 22.3807 22.6193 23.5 24 23.5ZM34.5 21C34.5 22.3807 33.3807 23.5 32 23.5C30.6193 23.5 29.5 22.3807 29.5 21C29.5 19.6193 30.6193 18.5 32 18.5C33.3807 18.5 34.5 19.6193 34.5 21ZM16 23.5C17.3807 23.5 18.5 22.3807 18.5 21C18.5 19.6193 17.3807 18.5 16 18.5C14.6193 18.5 13.5 19.6193 13.5 21C13.5 22.3807 14.6193 23.5 16 23.5Z" fill="#EE7B04"/>
  </svg>
);

const IconWrench = () => (
  <svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4 0a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4V4a4 4 0 00-4-4H4zm7.293 3.292a3 3 0 00-4.001 4.001l-4 4a1 1 0 101.415 1.414l4-4a3 3 0 004.001-4.001l-2 2.001a1 1 0 11-1.415-1.414l2-2z" fill="#EE7B04"/>
  </svg>
);

const challenges = [
  {
    icon: <IconWarning />,
    title: "Prévisions limitées",
    text: "Les coupures imprévues restent difficiles à prévoir suffisamment tôt.",
  },
  {
    icon: <IconInfo />,
    title: "Informations dispersées",
    text: "Les données du réseau, de la météo et des incidents proviennent de plusieurs sources.",
  },
  {
    icon: <IconMessage />,
    title: "Temps de préparation réduit",
    text: "Les utilisateurs ne disposent pas toujours du temps nécessaire pour se préparer.",
  },
  {
    icon: <IconWrench />,
    title: "Maintenance réactive",
    text: "Certaines interventions commencent seulement après l’apparition d’une panne.",
  },
];

function Logo({ className = "" }) {
  return (
    <span className={`logo-frame ${className}`} aria-label="JIRAMA Predictive">
      <img src="https://i.ibb.co/VWNN1s6Y/image.png" alt="Logo JIRAMA Predictive" />
    </span>
  );
}

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <section className="hero" id="accueil">
        <img
          className="hero-image"
          src="https://i.ibb.co/2B5jR2P/Centre.png"
          alt="Centrale hydroélectrique entourée de forêt"
        />
        <div className="hero-overlay" />

        <header className="navbar">
          <a href="#accueil" aria-label="Retour à l’accueil">
            <Logo />
          </a>

          <nav className="desktop-nav" aria-label="Navigation principale">
            <a className="active" href="#accueil">Accueil</a>
            <a href="#mission">À propos</a>
            <a href="#services">Nos services</a>
            <a href="#contact">Contacts</a>
          </nav>

          <div className="nav-right">
            <a className="login-button" href="/dashboard">
              Dashboard{" "}
              <svg
                fill="currentColor"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                id="dashboard"
                data-name="Flat Color"
                xmlns="http://www.w3.org/2000/svg"
                className="icon flat-color"
                style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}
              >
                <path id="secondary" d="M22,4V7a2,2,0,0,1-2,2H15a2,2,0,0,1-2-2V4a2,2,0,0,1,2-2h5A2,2,0,0,1,22,4ZM9,15H4a2,2,0,0,0-2,2v3a2,2,0,0,0,2,2H9a2,2,0,0,0,2-2V17A2,2,0,0,0,9,15Z" style={{ fill: "rgb(44, 169, 188)" }}></path>
                <path id="primary" d="M11,4v7a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V4A2,2,0,0,1,4,2H9A2,2,0,0,1,11,4Zm9,7H15a2,2,0,0,0-2,2v7a2,2,0,0,0,2,2h5a2,2,0,0,0,2-2V13A2,2,0,0,0,20,11Z" style={{ fill: "currentColor" }}></path>
              </svg>
            </a>

            <details className="mobile-menu">
              <summary aria-label="Ouvrir le menu">☰</summary>
              <nav>
                <a href="#accueil">Accueil</a>
                <a href="#mission">À propos</a>
                <a href="#services">Nos services</a>
                <a href="#contact">Contacts</a>
              </nav>
            </details>
          </div>
        </header>

        <div className="hero-content">
          <p className="eyebrow">Intelligence énergétique • Madagascar</p>
          <h1>
            Voir avant la panne, <span>agir avant la coupure</span> pour
            anticiper les risques, optimiser les interventions et garantir une
            alimentation électrique plus fiable.
          </h1>
          <a className="primary-cta" href="#services">
            Voir les risques de coupures
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="stats" aria-label="Indicateurs de performance">
          <div><strong>6 zones</strong><span>Modélisation pilote</span></div>
          <div><strong>24h</strong><span>Horizon MVP principal</span></div>
        </div>
      </section>

      <section className="section mission-section" id="mission">
        <div className="section-heading">
          <span />
          <div>
            <p>Notre engagement</p>
            <h2>Notre Mission</h2>
          </div>
        </div>

        <div className="mission-grid">
          {missions.map((mission) => (
            <article className={`mission-card ${mission.tone}`} key={mission.title}>
              <span className="card-number">0{missions.indexOf(mission) + 1}</span>
              <h3>{mission.title}</h3>
              <p>{mission.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section challenges-section" id="services">
        <div className="section-heading">
          <span />
          <div>
            <p>Le constat</p>
            <h2>Pourquoi nous utiliser ?</h2>
          </div>
        </div>

        <p className="section-intro">
          Les coupures électriques peuvent affecter les activités
          professionnelles, les services publics et le quotidien des ménages.
          JIRAMA Predictive rend l’information plus accessible et aide les
          équipes à mieux anticiper les situations à risque.
        </p>

        <div className="challenge-grid">
          {challenges.map((challenge) => (
            <article className="challenge-card" key={challenge.title}>
              <div className="challenge-icon" aria-hidden="true">{challenge.icon}</div>
              <div>
                <h3>{challenge.title}</h3>
                <p>{challenge.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer id="contact">
        <div className="footer-brand">
          <Logo className="footer-logo" />
          <p>La donnée au service d’une énergie plus fiable.</p>
        </div>

        <div className="footer-contact">
          <a href="tel:+261382130529"><span>☎</span> +261 38 21 305 29</a>
          <a href="mailto:jirama@gmail.com"><span>✉</span> jirama@gmail.com</a>
          <a href="#"><span>f</span> JIRAMA Actus</a>
        </div>

        <nav className="footer-nav" aria-label="Navigation secondaire">
          <a href="#accueil">Accueil</a>
          <a href="#mission">À propos</a>
          <a href="#services">Nos services</a>
          <a href="#contact">Contact</a>
        </nav>

        <p className="footer-message">
          Voir au-delà des pannes, <span>anticiper chaque coupure et construire</span>{" "}
          dès aujourd’hui le réseau électrique intelligent de demain.
        </p>
      </footer>
    </motion.main>
  );
}
