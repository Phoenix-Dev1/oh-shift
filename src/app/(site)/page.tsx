import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <div className="relative h-full flex flex-col items-center justify-center bg-bg-800 text-text-primary">
      {/* Background SVG Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Abstract Waves */}
        <path
          d="M0 300 C150 400 350 200 500 300 C650 400 800 200 800 300 V600 H0 V300 Z"
          fill="var(--bg-700)"
          opacity="0.2"
        />
        <path
          d="M0 400 C200 500 400 150 600 250 C800 350 800 250 800 400 V600 H0 V400 Z"
          fill="var(--bg-600)"
          opacity="0.2"
        />
      </svg>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Title and Subtitle */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-wide">
            <span className="text-highlight">Oh-Shift</span>
          </h1>
          <p className="text-lg sm:text-xl text-text-secondary mt-4">
            Streamline your scheduling with ease.
          </p>
        </div>

        {/* Authentication Form */}
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
