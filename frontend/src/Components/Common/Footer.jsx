import { FiMail, FiPhone, FiGithub, FiTwitter } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} FinanceHub. All rights reserved.
        </p>

        <div className="flex items-center space-x-4 text-slate-600 dark:text-slate-400">
          <FiMail size={18} />
          <FiPhone size={18} />
          <FiGithub size={18} />
          <FiTwitter size={18} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
