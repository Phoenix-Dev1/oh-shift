import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div
      className="
    h-screen 
    bg-bg-900 
    dark:bg-bg-900 
    flex 
    min-h-full 
    flex-col 
    justify-center 
    items-center
    sm:px-6 
    lg:px9"
    >
      <span className="md:w-3/5 sm:w-full">
        <AuthForm />
      </span>
    </div>
  );
}
