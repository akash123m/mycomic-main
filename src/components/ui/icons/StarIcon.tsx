import type { SVGProps } from "react";

/** A balanced, standard five-point rating icon. */
export default function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.095 3.37a1 1 0 0 0 .95.69h3.543c.969 0 1.371 1.24.588 1.81l-2.867 2.084a1 1 0 0 0-.364 1.118l1.095 3.37c.3.922-.755 1.688-1.539 1.118l-2.867-2.084a1 1 0 0 0-1.176 0l-2.867 2.084c-.783.57-1.838-.196-1.539-1.118l1.095-3.37a1 1 0 0 0-.364-1.118L2.873 8.797c-.784-.57-.38-1.81.588-1.81h3.543a1 1 0 0 0 .951-.69l1.094-3.37Z" />
    </svg>
  );
}
