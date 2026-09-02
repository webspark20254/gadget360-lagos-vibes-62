import { useState } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  priority?: boolean;
}

const OptimizedImage = ({ src, alt, priority = false, className, ...props }: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`
          transition-opacity duration-300
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
          ${hasError ? 'hidden' : ''}
          w-full h-full object-cover
        `}
        {...props}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="sr-only">{alt}</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;