"use client";

import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { BsGithub, BsGoogle } from "react-icons/bs";
import Input from "../../components/inputs/Input";
import Button from "../../components/Button";
import AuthSocialButton from "./AuthSocialButton";
import { signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.status === "authenticated") {
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
      password: "1q2w3e4r",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === "REGISTER") {
      axios
        .post("/api/register", data)
        .then(() => signIn("credentials", { ...data, redirect: false }))
        .catch(() => toast.error("Registration failed"))
        .finally(() => setIsLoading(false));
    } else {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
          }
          if (callback?.ok && !callback.error) {
            toast.success("Welcome back!");
            router.push("/calendar");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Authentication failed");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <motion.div layout className="space-y-6">
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
          <Button disabled={isLoading} fullWidth type="submit">
            {variant === "LOGIN" ? "Sign in" : "Create account"}
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
