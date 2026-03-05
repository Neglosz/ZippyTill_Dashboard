import React, { createContext, useContext, useState, useEffect } from "react";

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [activeBranchId, setActiveBranchId] = useState(() => {
    return sessionStorage.getItem("selected_branch_id");
  });
  const [activeBranchName, setActiveBranchName] = useState(() => {
    return sessionStorage.getItem("selected_branch_name");
  });
  const [activeBranchImage, setActiveBranchImage] = useState(() => {
    return sessionStorage.getItem("selected_branch_image");
  });
  const [userRole, setUserRole] = useState(() => {
    return sessionStorage.getItem("user_role");
  });

  const selectBranch = (branch) => {
    if (!branch) {
      setActiveBranchId(null);
      setActiveBranchName(null);
      setActiveBranchImage(null);
      setUserRole(null);
      sessionStorage.removeItem("selected_branch_id");
      sessionStorage.removeItem("selected_branch_name");
      sessionStorage.removeItem("selected_branch_image");
      sessionStorage.removeItem("user_role");
      return;
    }

    setActiveBranchId(branch.id);
    setActiveBranchName(branch.name);
    setActiveBranchImage(branch.image_url);
    setUserRole(branch.role);
    sessionStorage.setItem("selected_branch_id", branch.id);
    sessionStorage.setItem("selected_branch_name", branch.name);
    sessionStorage.setItem("selected_branch_image", branch.image_url || "");
    sessionStorage.setItem("user_role", branch.role);
  };

  const clearBranch = () => {
    selectBranch(null);
  };

  return (
    <BranchContext.Provider
      value={{
        activeBranchId,
        activeBranchName,
        activeBranchImage,
        setActiveBranchImage,
        userRole,
        selectBranch,
        clearBranch,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};
