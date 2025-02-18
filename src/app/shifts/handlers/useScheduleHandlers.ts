import { toast } from "react-toastify";

export const handleCreateSchedule = async () => {
  try {
    const response = await fetch("/api/schedule", {
      method: "POST",
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("Schedule created successfully!");
    } else {
      toast.error(data.error || "Failed to create schedule.");
    }
  } catch (error) {
    toast.error("An error occurred. Please try again.");
  }
};
