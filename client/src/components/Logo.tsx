import React from "react";

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-[#F3D27A] bg-gradient-to-br from-[#EE7D32] via-[#C65D24] to-[#8E2F12] text-[#FFF4D2]"
      style={{ width: size, height: size, fontSize: size * 0.58, lineHeight: 1 }}
    >
      <span style={{ marginTop: size * 0.06 }}>ॐ</span>
    </span>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="font-extrabold tracking-tight text-heading" style={{ fontSize: size * 0.58 }}>
        Ved<span className="text-saffron">Rit</span>
      </span>
    </span>
  );
}
