interface SubmitButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export default function SubmitButton({ 
  onClick, 
  isLoading = false, 
  disabled = false,
  children = "Submit"
}: SubmitButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        px-6 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center justify-center gap-2
        ${isLoading || disabled 
          ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
          : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
        }
      `}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:translate-x-0.5 transition-transform duration-200"
          >
            <path d="M5 12h14m-7-7 7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}
