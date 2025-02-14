import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div
      className="h-screen bg-bg-900 dark:bg-bg-900 flex 
    min-h-full 
    flex-col 
    justify-center 
    py-12 
    sm:px-6 
    lg:px9 "
    >
      <AuthForm />
    </div>
  );
}
