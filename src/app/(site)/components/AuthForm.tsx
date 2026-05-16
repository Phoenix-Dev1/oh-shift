"use client";

import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from "react-icons/bs";
import Input from "../../components/inputs/Input";
import Button from "../../components/Button";
import AuthSocialButton from "./AuthSocialButton";
import { signIn, useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
      setIsRedirecting(true);
      router.push("/calendar");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    setVariant((prev) => prev === "LOGIN" ? "REGISTER" : "LOGIN");
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "demo@gmail.com",
      password: "WhiteFlag15@",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() => signIn("credentials", { ...data, redirect: false }))
        .catch(() => {
          toast.error("Registration failed");
          setIsLoading(false);
        });
    } else {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
            setIsLoading(false);
          }
          if (callback?.ok && !callback.error) {
            // Set redirecting immediately — don't wait for useSession to update
            setIsRedirecting(true);
            toast.success("Welcome back!");
            router.push("/calendar");
          }
        });
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Authentication failed");
          setIsLoading(false);
        }
      });
  };

  // Show full-screen overlay as soon as we know we're redirecting
  const showOverlay = isRedirecting;

  return (
    <motion.div layout className="relative space-y-6">
      {/* Full-Screen Redirecting Overlay — triggered by isRedirecting, not session state */}
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 border-[3px] border-slate-200 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Preparing your workspace
                </p>
                <p className="text-xs text-slate-400">
                  Loading your schedule...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form
        layout
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AnimatePresence>
          {variant === "REGISTER" && (
            <motion.div
              key="name-field"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pb-4">
                <Input
                  id="name"
                  label="Full Name"
                  register={register}
                  errors={errors}
                  disabled={isLoading}
                  required
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          id="email"
          label="Email Address"
          type="email"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
        />

        <Input
          id="password"
          label="Password"
          type="password"
          register={register}
          errors={errors}
          disabled={isLoading}
          required
        />

        <motion.div layout className="pt-2">
          <Button disabled={isLoading || isRedirecting} fullWidth type="submit">
            {isRedirecting 
              ? "Redirecting..."
              : isLoading 
                ? "Authenticating..." 
                : variant === "LOGIN" ? "Sign in" : "Create account"}
          </Button>
        </motion.div>
      </motion.form>

      <motion.div layout>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider font-semibold">
            <span className="px-3 bg-white dark:bg-slate-900 text-slate-400">
              Social Authentication
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <AuthSocialButton
            icon={BsGithub}
            onClick={() => socialAction("github")}
          />
          <AuthSocialButton
            icon={BsGoogle}
            onClick={() => socialAction("google")}
          />
        </div>

        <div className="text-center pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-sm text-slate-500">
            {variant === "LOGIN" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              onClick={toggleVariant}
              className="text-indigo-600 hover:text-indigo-500 font-semibold transition-colors"
            >
              {variant === "LOGIN" ? "Join Oh-Shift" : "Sign in here"}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthForm;
