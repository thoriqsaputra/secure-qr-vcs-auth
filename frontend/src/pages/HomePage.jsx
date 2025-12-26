import React from 'react';
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const HomePage = () => {
  return (
    <div className="space-y-24 animate-fade-in-up">
      {/* Hero Section with enhanced design */}
      <section className="relative text-center space-y-8 py-12 sm:py-20">

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-main leading-tight animate-fade-in delay-100">
          Secure <span className="text-gradient inline-block">Visual Cryptography</span><br />
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-text-muted font-medium">for Event Tickets</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-text-muted max-w-3xl mx-auto leading-relaxed px-4 animate-fade-in delay-200">
          Prevent ticket fraud with{' '}
          <span className="text-primary font-semibold">2-out-of-2 Visual Secret Sharing</span>.
          ArUco marker alignment ensures{' '}
          <span className="text-accent font-semibold">pixel-perfect reconstruction</span>{' '}
          with rotation robustness at 0°, 90°, 180°, and 270°.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 px-4 animate-fade-in delay-300">
          <Button
            to="/buy"
            size="lg"
            className="shadow-glow hover:scale-105"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            }
          >
            Issue Ticket
          </Button>
          <Button
            to="/verify"
            variant="secondary"
            size="lg"
            className="hover:scale-105"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            Verify Ticket
          </Button>
        </div>
      </section>

      
    </div>
  );
};

export default HomePage;
