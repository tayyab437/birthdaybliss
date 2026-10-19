import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import BirthdaySite from "@/pages/BirthdaySite";
import ProposalPage from "@/pages/ProposalPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={BirthdaySite} />
      <Route path="/proposal" component={ProposalPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
