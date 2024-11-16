interface SectionProps {
    children: React.ReactNode;
    className?: string;
  }
  
  export default function Section({ children, className }: SectionProps) {
    return (
      <div className={`w-11/12 lg:w-3/4 mx-auto ${className}`}>{children}</div>
    );
  }
  