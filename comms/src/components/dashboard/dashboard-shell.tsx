interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
}: DashboardShellProps) {
  return (
    <div className="flex flex-col gap-8">
      {children}
    </div>
  );
} 