"use client";

import { useEffect, useState } from "react";
import { fetchManagerName } from "../../../actions/fetchManager";

interface ManagerInfoProps {
  managerId: string;
}

const maskManagerId = (id: string): string => {
  // Show only the last 4 characters with preceding asterisks
  const lastFour = id.slice(-4);
  return "********" + lastFour;
};

export default function ManagerInfo({ managerId }: ManagerInfoProps) {
  const [managerName, setManagerName] = useState<string>("");

  useEffect(() => {
    const getManagerName = async () => {
      const name = await fetchManagerName(managerId);
      setManagerName(name || "None");
    };
    if (managerId) {
      getManagerName();
    }
  }, [managerId]);

  return (
    <div>
      <p className="text-sm">
        Current Manager ID:{" "}
        <span className="font-medium">{maskManagerId(managerId)}</span>
      </p>
      <p className="text-sm">
        Current Manager Name: <span className="font-medium">{managerName}</span>
      </p>
    </div>
  );
}
