"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Phone } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Image from "next/image";

const Hero = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-center mt-12">
      {/* Left Column - Text Content */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="font-mono text-primary text-lg mb-4 block">
            Hi, my name is
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4 tracking-tight">
            Minh Tam Nguyen.
          </h1>
        </motion.div>

        <motion.p
          className="max-w-xl text-lg text-muted-foreground leading-relaxed mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          I&apos;m a Software Development student at SAIT and Tech Lead on a production-scale SaaS capstone. Experienced in building secure, scalable full-stack applications with modern web and mobile technologies.
        </motion.p>

        {/* Contact Info */}
        <motion.div
          className="flex flex-col gap-3 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-sm md:text-base">
              Calgary, Alberta, Canada
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="w-5 h-5 text-primary" />
            <a
              href="mailto:tamnguyen277353@gmail.com"
              className="text-sm md:text-base hover:text-primary transition-colors"
            >
              tamnguyen277353@gmail.com
            </a>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="w-5 h-5 text-primary" />
            <a
              href="tel:+14034653488"
              className="text-sm md:text-base hover:text-primary transition-colors"
            >
              (403) 465-3488
            </a>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex items-center gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <a
            href="https://github.com/MinhTam2773"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-200 group"
            aria-label="GitHub"
          >
            <FaGithub className="w-7 h-7" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            href="https://www.linkedin.com/in/minhtam-dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-7 h-7" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </motion.div>
      </div>

      {/* Right Column - Image */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="relative rounded-full w-80 h-80 overflow-hidden border-4 border-primary/20 shadow-2xl shadow-primary/20 group">
          <Image
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            fill
            src={"/image.jpg"}
            alt="Minh Tam Nguyen - Software Developer"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Quick Stats */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center px-4 py-2 rounded-lg bg-secondary/40 backdrop-blur-sm">
            <p className="font-mono text-2xl font-bold text-primary">4.0</p>
            <p className="text-xs text-muted-foreground">GPA</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-secondary/40 backdrop-blur-sm">
            <p className="font-mono text-2xl font-bold text-primary">3+</p>
            <p className="text-xs text-muted-foreground">Projects</p>
          </div>
          <div className="text-center px-4 py-2 rounded-lg bg-secondary/40 backdrop-blur-sm">
            <p className="font-mono text-2xl font-bold text-primary">100%</p>
            <p className="text-xs text-muted-foreground">Success</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Hero;
