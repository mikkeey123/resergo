import React from "react";

const Loginmodal = ({ isOpen, onClose, children, disableOutsideClick = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10 backdrop-blur-sm"
      onClick={disableOutsideClick ? undefined : onClose} // close when clicking outside (unless disabled)
    >
      <div
        onClick={(e) => e.stopPropagation()} // prevent modal click from closing
      >
        {children}
      </div>
    </div>
  );
};

export default Loginmodal;