import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function ProposalButtonSection() {
  const [, setLocation] = useLocation();

  return (
    <section 
      id="proposal-button-section" 
      className="section bg-gradient-to-tr from-pink-50 to-purple-50 flex items-center justify-center px-4"
    >
      <div className="flex items-center justify-center w-full max-w-md">
        <motion.button
          onClick={() => setLocation('/proposal')}
          whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(124, 58, 237, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          className="w-full px-8 py-5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-full shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <span>dont click if your answer is no 😢</span>
        </motion.button>
      </div>
    </section>
  );
}
