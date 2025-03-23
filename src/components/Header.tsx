
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PlusCircle, MessageSquare, Home } from "lucide-react";
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
          >
            <MessageSquare className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-xl font-semibold tracking-tight">Dialogflow</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/forms" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/forms' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            My Forms
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button onClick={() => navigate('/create')} variant="default" size="sm" className="h-9">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Form</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;
