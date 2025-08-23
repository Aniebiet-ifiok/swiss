import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGlobe, FaLeaf, FaRocket, FaLock, FaArrowLeft } from "react-icons/fa";
import favicon from '../assets/favicon.png'

export default function About() {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const globeVariants = {
    initial: { scale: 0.85, opacity: 0.3 },
    animate: {
      rotate: 360,
      scale: [0.85, 0.9, 0.85],
      opacity: [0.3, 0.5, 0.3],
      transition: {
        rotate: { duration: 40, repeat: Infinity, ease: "linear" },
        scale: { duration: 2.5, repeat: Infinity, repeatType: "reverse" },
        opacity: { duration: 2.5, repeat: Infinity, repeatType: "reverse" },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.2 }}
      >
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-300/30 text-xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0%", "-200%"],
              x: [`${Math.random() * 30 - 15}%`, `${Math.random() * 30 - 15}%`],
              rotate: [0, 360],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              repeatType: "loop",
              delay: i * 0.3,
            }}
          >
            {React.createElement(
              [FaRocket, FaLeaf, FaLock][Math.floor(Math.random() * 3)]
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Navbar */}
      <motion.nav
        className="bg-gray-800/95 backdrop-blur-md shadow-md py-4 px-6 fixed w-full z-50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-cyan-300 tracking-tight">
            <img src={favicon} alt="Swiss Grant" className="w-6 h-6 inline-block " />
            <span>Swiss Grant</span>
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-200 font-medium hover:text-cyan-300 transition-colors duration-200 flex items-center"
            >
              <FaArrowLeft className="mr-2" /> Go Back
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        className="relative bg-gradient-to-br from-blue-900 via-cyan-800 to-blue-600 text-white pt-32 pb-24 overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="absolute top-8 right-8 w-[320px] h-[320px] opacity-50 pointer-events-none"
          variants={globeVariants}
          initial="initial"
          animate="animate"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/83/Earth_Western_Hemisphere.jpg"
            alt="Rotating Globe"
            className="w-full h-full object-cover rounded-full shadow-lg"
            style={{ filter: "drop-shadow(0 0 12px rgba(6, 182, 212, 0.3))" }}
          />
        </motion.div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-200 to-blue-100"
            variants={itemVariants}
          >
            About the Swiss Grant
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-100"
            variants={itemVariants}
          >
            A cornerstone of Switzerland’s commitment to global solidarity, reducing poverty, and promoting sustainable development worldwide.
          </motion.p>
        </div>
      </motion.section>

      {/* Vision Section */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-8 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Our Vision
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-center mb-10 max-w-3xl mx-auto text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            The Swiss Grant aims to reduce poverty, promote sustainable growth, and enhance quality of life for marginalized populations. By aligning with the UN Sustainable Development Goals, we foster systemic change through innovative, scalable, and sustainable solutions with local ownership at the core.
          </motion.p>
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-cyan-400/15"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">Local Ownership</h3>
              <p className="text-gray-200 text-sm">
                We prioritize community-driven solutions, ensuring projects are culturally sensitive and locally relevant.
              </p>
            </motion.div>
            <motion.div
              className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-md border border-cyan-400/15"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <h3 className="text-xl font-semibold mb-2 text-white">Innovation & Scalability</h3>
              <p className="text-gray-200 text-sm">
                Our grants support creative, scalable initiatives that drive long-term impact and systemic change.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Initiatives Section */}
      <section className="bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Our Core Focus Areas
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: FaLeaf,
                title: "Health & Well-being",
                desc: "Strengthening health systems, prioritizing maternal and child health, and enhancing pandemic preparedness.",
              },
              {
                icon: FaGlobe,
                title: "Education & Human Capital",
                desc: "Expanding equitable access to education and supporting vocational training for youth and vulnerable groups.",
              },
              {
                icon: FaRocket,
                title: "Governance & Institutions",
                desc: "Promoting transparency, accountability, and civic participation to foster democratic values.",
              },
              {
                icon: FaLock,
                title: "Environment & Climate Resilience",
                desc: "Supporting sustainable resource management and projects that protect biodiversity and build climate resilience.",
              },
            ].map((initiative, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/70 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-cyan-400/25 transition-all duration-300 border border-cyan-400/15"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ scale: 1.02 }}
              >
                <initiative.icon className="text-cyan-300 text-3xl mb-3 mx-auto" />
                <h3 className="text-xl font-semibold mb-2 text-white">{initiative.title}</h3>
                <p className="text-gray-200 text-sm">{initiative.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-gradient-to-br from-blue-900 to-gray-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-10 text-cyan-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Our Global Impact
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "60+", label: "Years of Impact" },
              { value: "65+", label: "Countries Supported" },
              { value: "Thousands", label: "Projects Funded" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="bg-gray-900/70 backdrop-blur-sm p-5 rounded-xl shadow-md"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <h3 className="text-2xl font-bold text-cyan-300">{stat.value}</h3>
                <p className="text-gray-200 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-16 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 to-blue-500/15 animate-gradient-x"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6"
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Partner with Us
          </motion.h2>
          <motion.p
            className="text-base md:text-lg mb-6 max-w-md mx-auto text-gray-100"
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Join the Swiss Grant to drive innovative, sustainable, and inclusive development projects worldwide.
          </motion.p>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link
              to="/register"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-transform duration-200 shadow-md hover:scale-105"
            >
              Become a Partner
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800/95 backdrop-blur-md py-6 text-center text-gray-200 border-t border-gray-700">
        <div className="container mx-auto px-6">
          <p className="mb-3 text-sm">© 2025 Swiss Grant. All rights reserved.</p>
          <div className="flex justify-center space-x-4 text-sm">
            <a href="#" className="hover:text-cyan-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-300 transition-colors">Terms of Service</a>
            <Link to="/contact" className="hover:text-cyan-300 transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 10s ease infinite;
        }
      `}</style>
    </div>
  );
}