import { IconType } from "react-icons";

interface AuthSocialButtonProps {
  icon: IconType;
  onClick: () => void;
}

const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({
  icon: Icon,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full justify-center rounded-lg bg-white dark:bg-slate-950 px-4 py-2 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-all active:scale-95 focus:outline-none"
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export default AuthSocialButton;
