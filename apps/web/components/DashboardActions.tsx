"use client";

import { useState } from "react";
import { Button } from "@vibe3/ui";
import { CreateProjectModal } from "./CreateProjectModal";

export function DashboardActions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setShowModal(true)}
        className="px-8 py-4 flex items-center space-x-3 h-auto"
      >
        <svg width="20" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
        <span>NEW PROJECT</span>
      </Button>
      
      {showModal && <CreateProjectModal onClose={() => setShowModal(false)} />}
    </>
  );
}
