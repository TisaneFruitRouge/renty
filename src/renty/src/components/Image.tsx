import { forwardRef, type ImgHTMLAttributes } from "react";

type ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src: string;
  alt: string;
  width?: number | `${number}`;
  height?: number | `${number}`;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ fill, priority: _priority, sizes: _sizes, style, width, height, ...props }, ref) => {
    const fillStyle = fill
      ? {
          position: "absolute" as const,
          inset: 0,
          width: "100%",
          height: "100%",
        }
      : undefined;

    return (
      <img
        ref={ref}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        style={{ ...fillStyle, ...style }}
        {...props}
      />
    );
  },
);

Image.displayName = "Image";

export default Image;
