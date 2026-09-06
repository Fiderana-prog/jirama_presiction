"use client";

import { motion } from "motion/react";
import Link from "next/link";
import PredictionsView from "../../components/PredictionsView";
import "../dashboard/dashboard.css";

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="JIRAMA Predictive">
      <img src="https://i.ibb.co/VWNN1s6Y/image.png" alt="JIRAMA Predictive Logo" />
    </div>
  );
}

export default function PredictionsPage() {
  return (
    <motion.div
      className="dashboard-shell"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="background-overlay" />

      {/* Topbar matching dashboard */}
      <header className="topbar">
        <Link href="/dashboard">
          <BrandMark />
        </Link>

        <nav className="main-nav" aria-label="Navigation principale">
          <Link href="/dashboard" className="nav-item">
            <span>Dashboard</span>
          </Link>
          <Link href="/prediction" className="nav-item active">
            <span>Prédictions</span>
          </Link>
          <Link href="/connexion" className="nav-item">
            <span>Connexion</span>
          </Link>
        </nav>

        <div className="account-tools">
          <Link href="/dashboard" className="primary-button" style={{ textDecoration: "none", minHeight: "42px" }}>
            ← Retour Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content matching dashboard heading */}
      <main className="dashboard-content">
        <section className="dashboard-heading">
          <div>
            <span className="eyebrow">JIRAMA PREDICTIVE</span>
            <h1>Prédictions</h1>
            <p>Analyse temporelle, niveau de risque et activité du réseau électrique.</p>
          </div>
          <div className="heading-actions">
            <Link href="/dashboard" className="primary-button" style={{ textDecoration: "none" }}>
              Vue Dashboard →
            </Link>
          </div>
        </section>

        <PredictionsView />
      </main>
    </motion.div>
  );
}
