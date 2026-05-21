import Spinner from './Spinner';

export default function Button({
  children, variant = 'primary', loading = false,
  className = '', ...props
}) {
  const variants = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    danger:    'btn-danger',
  };
  return (
    <button
      className={`${variants[variant]} flex items-center justify-center gap-2 ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner size="sm" color="white" />}
      {children}
    </button>
  );
}