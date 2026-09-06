'use client'

import { useMemo, useState } from 'react';

const initialForm = {
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
      <path d="M3 3l18 18M10.7 10.7a2 2 0 002.6 2.6M9.9 4.2A10.7 10.7 0 0112 4c5.2 0 8.8 4.1 9.7 6.1a4.6 4.6 0 010 3.8 13 13 0 01-2.2 3.1M6.6 6.6A13.2 13.2 0 002.3 10a4.6 4.6 0 000 4c.9 2 4.5 6 9.7 6 1.2 0 2.4-.2 3.4-.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 fill-none stroke-current stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
      <path d="M2.3 10.1a4.6 4.6 0 000 3.8C3.2 15.9 6.8 20 12 20s8.8-4.1 9.7-6.1a4.6 4.6 0 000-3.8C20.8 8.1 17.2 4 12 4S3.2 8.1 2.3 10.1z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[22px] fill-none stroke-current stroke-2 stroke-linecap-round stroke-linejoin-round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[17px] fill-none stroke-current stroke-[2.4] stroke-linecap-round stroke-linejoin-round">
      <path d="M5 12.5l4.2 4.2L19 7" />
    </svg>
  );
}

export default function Inscription() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = useMemo(() => {
    const value = form.password;
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    return score;
  }, [form.password]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.lastName.trim()) nextErrors.lastName = 'Le nom est obligatoire.';
    if (!form.firstName.trim()) nextErrors.firstName = 'Le prénom est obligatoire.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = 'Saisissez une adresse e-mail valide.';
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Utilisez au moins 8 caractères.';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Les mots de passe ne correspondent pas.';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ ...nextErrors, email: data.error || "Erreur lors de l'inscription" });
      } else {
        setSubmitted(true);
      }
    } catch (error) {
      setErrors({ ...nextErrors, email: 'Erreur réseau' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main 
      className="min-h-screen lg:h-screen lg:overflow-hidden grid place-items-center p-0 lg:p-[clamp(18px,3vw,46px)] bg-[#f5f6f6]"
      style={{
        backgroundImage: `radial-gradient(circle at 15% 15%, rgba(245, 130, 0, 0.07), transparent 26%), radial-gradient(circle at 90% 90%, rgba(31, 122, 56, 0.07), transparent 25%)`
      }}
    >
      <section className="w-full max-w-[1500px] lg:h-full min-h-[100vh] lg:min-h-0 lg:max-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[minmax(0,1.75fr)_minmax(420px,0.9fr)] overflow-hidden rounded-none lg:rounded-[44px] bg-white shadow-none lg:shadow-[0_35px_90px_rgba(22,32,38,0.15)]" aria-label="Inscription professionnelle">
        <div 
          className="relative min-h-[380px] lg:min-h-0 lg:h-full overflow-hidden p-[28px] lg:p-[clamp(40px,5vw,78px)] rounded-b-[34px] lg:rounded-none text-white bg-[#081729] bg-[position:center_43%] lg:bg-center bg-cover bg-no-repeat"
          style={{ backgroundImage: `url('https://i.ibb.co/twGHgrp1/login.png')` }}
        >
          <div 
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, rgba(6, 19, 34, 0.42), rgba(6, 19, 34, 0.15) 62%, rgba(6, 19, 34, 0.34)), linear-gradient(180deg, rgba(3, 13, 25, 0.18), rgba(3, 13, 25, 0.32) 54%, rgba(3, 13, 25, 0.82))`
            }}
          />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 74% 65%, rgba(245, 130, 0, 0.13), transparent 22%)`
            }}
          />

          <a className="relative z-10 hidden lg:inline-flex items-center gap-3 text-white no-underline" href="/" aria-label="JIRAMA Predictive, accueil">
            <span className="w-11 h-11 grid place-items-center rounded-[14px] text-white bg-gradient-to-br from-[#f58200] to-[#ffad3f] shadow-[0_12px_28px_rgba(245,130,0,0.3)]" aria-hidden="true">⚡</span>
            <span>
              <strong className="block tracking-[0.14em] text-[0.95rem]">JIRAMA</strong>
              <small className="block tracking-[0.14em] mt-[2px] text-[#88d89a] text-[0.62rem]">PREDICTIVE</small>
            </span>
          </a>

          <div className="relative z-10 mt-[30px] lg:mt-[clamp(50px,8vh,106px)]">
            <p className="m-0 uppercase tracking-[-0.045em] text-[clamp(2.4rem,11vw,4.2rem)] lg:text-[clamp(3rem,5.6vw,6.4rem)] font-[730] leading-[0.92]">INSCRIVEZ-</p>
            <h1 className="flex items-center gap-[clamp(18px,2vw,34px)] m-0 mt-[18px] uppercase tracking-[-0.045em] text-[clamp(3rem,14vw,5rem)] lg:text-[clamp(3.6rem,6.2vw,7.4rem)] font-[760] leading-[0.9]">
              <span className="w-[8px] lg:w-[12px] h-[70px] lg:h-[clamp(78px,8.5vw,132px)] flex-none rounded-full bg-[#f58200] shadow-[0_0_30px_rgba(245,130,0,0.4)]" />
              Vous
            </h1>
          </div>

          <div className="absolute z-10 left-[28px] lg:left-[clamp(40px,5vw,78px)] right-[28px] lg:right-[clamp(40px,7vw,120px)] bottom-[30px] lg:bottom-[clamp(44px,6vw,76px)] grid grid-cols-[10px_1fr] items-stretch gap-[14px] lg:gap-[22px]">
            <span className="rounded-full bg-[#f58200] shadow-[0_0_24px_rgba(245,130,0,0.35)]" aria-hidden="true" />
            <p className="max-w-[760px] m-0 text-[0.9rem] lg:text-[clamp(1rem,1.35vw,1.35rem)] font-[650] leading-[1.5] lg:leading-[1.62] drop-shadow-md">
              Créez votre espace professionnel pour consulter les prévisions de coupures,
              suivre les zones à risque, gérer les alertes et accéder aux données essentielles
              du réseau électrique.
            </p>
          </div>
        </div>

        <div className="flex items-center p-[42px_26px_50px] lg:p-[clamp(42px,5vw,86px)_clamp(34px,4vw,72px)] bg-white/98 lg:overflow-y-auto">
          <div className="w-full max-w-[520px] mx-auto lg:my-auto">
            <div className="mb-[30px] lg:mb-[36px]">
              <p className="m-0 mb-2 text-[#db6c00] text-[0.76rem] font-[800] tracking-[0.15em] uppercase">JIRAMA Predictive</p>
              <h2 className="m-0 text-[#172026] text-[clamp(1.8rem,2.4vw,2.6rem)] leading-[1.1]">Créer un compte professionnel</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] md:gap-y-[28px] md:gap-x-[20px]">
                <label className="block min-w-0">
                  <span className="block mb-[9px] text-[#6f7477] text-[0.9rem] font-[750]">Votre nom</span>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    placeholder="Andriam..."
                    aria-invalid={Boolean(errors.lastName)}
                    className={`w-full h-[50px] px-[2px] border-0 border-b-[1.5px] ${errors.lastName ? 'border-[#d53c35]' : 'border-[#202426]'} rounded-none outline-none text-[#172026] bg-transparent transition-all duration-160 focus:border-[#f58200] focus:shadow-[0_2px_0_#f58200] placeholder:text-[#afb3b5]`}
                  />
                  {errors.lastName && <small className="block mt-[7px] text-[#c8322d] text-[0.75rem] font-[650]">{errors.lastName}</small>}
                </label>

                <label className="block min-w-0">
                  <span className="block mb-[9px] text-[#6f7477] text-[0.9rem] font-[750]">Votre prénom</span>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    placeholder="Abraham"
                    aria-invalid={Boolean(errors.firstName)}
                    className={`w-full h-[50px] px-[2px] border-0 border-b-[1.5px] ${errors.firstName ? 'border-[#d53c35]' : 'border-[#202426]'} rounded-none outline-none text-[#172026] bg-transparent transition-all duration-160 focus:border-[#f58200] focus:shadow-[0_2px_0_#f58200] placeholder:text-[#afb3b5]`}
                  />
                  {errors.firstName && <small className="block mt-[7px] text-[#c8322d] text-[0.75rem] font-[650]">{errors.firstName}</small>}
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <span className="block mb-[9px] text-[#6f7477] text-[0.9rem] font-[750]">E-mail professionnel</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    placeholder="prenom.nom@jirama.mg"
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full h-[50px] px-[2px] border-0 border-b-[1.5px] ${errors.email ? 'border-[#d53c35]' : 'border-[#202426]'} rounded-none outline-none text-[#172026] bg-transparent transition-all duration-160 focus:border-[#f58200] focus:shadow-[0_2px_0_#f58200] placeholder:text-[#afb3b5]`}
                  />
                  {errors.email && <small className="block mt-[7px] text-[#c8322d] text-[0.75rem] font-[650]">{errors.email}</small>}
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <span className="block mb-[9px] text-[#6f7477] text-[0.9rem] font-[750]">Mot de passe</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Au moins 8 caractères"
                      aria-invalid={Boolean(errors.password)}
                      className={`w-full h-[50px] pl-[2px] pr-[46px] border-0 border-b-[1.5px] ${errors.password ? 'border-[#d53c35]' : 'border-[#202426]'} rounded-none outline-none text-[#172026] bg-transparent transition-all duration-160 focus:border-[#f58200] focus:shadow-[0_2px_0_#f58200] placeholder:text-[#afb3b5]`}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-[2px] w-[38px] h-[38px] grid place-items-center -translate-y-1/2 border-0 rounded-[12px] text-[#82888b] bg-transparent cursor-pointer hover:text-[#db6c00] hover:bg-[#f58200]/10"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {form.password && (
                    <div className="grid grid-cols-4 gap-[5px] mt-[10px]" aria-label={`Robustesse : ${passwordStrength} sur 4`}>
                      {[1, 2, 3, 4].map((item) => (
                        <span key={item} className={`h-[4px] rounded-full ${passwordStrength >= item ? 'bg-gradient-to-r from-[#f58200] to-[#ffb748]' : 'bg-[#e3e5e6]'}`} />
                      ))}
                    </div>
                  )}
                  {errors.password && <small className="block mt-[7px] text-[#c8322d] text-[0.75rem] font-[650]">{errors.password}</small>}
                </label>

                <label className="block min-w-0 md:col-span-2">
                  <span className="block mb-[9px] text-[#6f7477] text-[0.9rem] font-[750]">Confirmer le mot de passe</span>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      placeholder="Saisissez à nouveau le mot de passe"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      className={`w-full h-[50px] pl-[2px] pr-[46px] border-0 border-b-[1.5px] ${errors.confirmPassword ? 'border-[#d53c35]' : 'border-[#202426]'} rounded-none outline-none text-[#172026] bg-transparent transition-all duration-160 focus:border-[#f58200] focus:shadow-[0_2px_0_#f58200] placeholder:text-[#afb3b5]`}
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-[2px] w-[38px] h-[38px] grid place-items-center -translate-y-1/2 border-0 rounded-[12px] text-[#82888b] bg-transparent cursor-pointer hover:text-[#db6c00] hover:bg-[#f58200]/10"
                      onClick={() => setShowConfirm((value) => !value)}
                      aria-label={showConfirm ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <small className="block mt-[7px] text-[#c8322d] text-[0.75rem] font-[650]">{errors.confirmPassword}</small>
                  )}
                </label>
              </div>

              <label className="flex items-start gap-[11px] my-[28px] text-[#676d70] text-[0.82rem] leading-[1.5] cursor-pointer">
                <input type="checkbox" required className="w-[17px] h-[17px] flex-none mt-[2px] accent-[#f58200]" />
                <span>
                  J’accepte les règles de sécurité et confirme que ces informations sont exactes.
                </span>
              </label>

              <button 
                className="w-full min-h-[58px] lg:min-h-[62px] flex items-center justify-center gap-[12px] border-0 rounded-[18px] text-white bg-gradient-to-br from-[#f58200] to-[#ff991f] shadow-[0_16px_30px_rgba(245,130,0,0.27)] font-[800] cursor-pointer transition-all duration-160 hover:-translate-y-[2px] hover:shadow-[0_20px_36px_rgba(245,130,0,0.34)] hover:saturate-[1.06] disabled:cursor-wait disabled:opacity-72" 
                type="submit" 
                disabled={isSubmitting}
              >
                <span>{isSubmitting ? 'Création du compte…' : 'S’inscrire'}</span>
                <ArrowIcon />
              </button>

              {submitted && (
                <div className="flex gap-[12px] mt-[20px] p-[15px_16px] border border-[#1f7a38]/20 rounded-[16px] text-[#1c6531] bg-[#1f7a38]/10" role="status">
                  <span className="w-[28px] h-[28px] flex-none grid place-items-center rounded-full text-white bg-[#1f7a38]"><CheckIcon /></span>
                  <p className="m-0 mt-[1px] text-[0.82rem] leading-[1.5]">
                    Demande envoyée. Le compte devra être validé par un administrateur avant activation.
                  </p>
                </div>
              )}

              <p className="mt-[24px] mb-0 text-center text-[#7c8285] text-[0.85rem]">
                Vous avez déjà un compte ? <a href="/connexion" className="text-[#db6c00] font-[800] no-underline hover:underline">Se connecter</a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
